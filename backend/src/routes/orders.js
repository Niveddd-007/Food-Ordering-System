const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Place Order
router.post('/orders', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const { delivery_address, payment_method, notes } = req.body;

        if (!delivery_address || !payment_method) {
            return res.status(400).json({ error: 'Delivery address and payment method are required' });
        }

        const cart = db.prepare('SELECT * FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart || !cart.restaurant_id) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        const cartItems = db.prepare(`
            SELECT ci.*, mi.price, mi.is_available
            FROM cart_items ci
            JOIN menu_items mi ON ci.item_id = mi.item_id
            WHERE ci.cart_id = ?
        `).all(cart.cart_id);

        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        // Check availability
        const unavailable = cartItems.find(item => !item.is_available);
        if (unavailable) {
            return res.status(400).json({ error: 'One or more items in your cart are currently unavailable' });
        }

        // Calculate Totals
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = +(subtotal * 0.05).toFixed(2);
        const deliveryFee = 3.99;
        const total = +(subtotal + tax + deliveryFee).toFixed(2);

        // Assign Available Delivery Driver if possible
        const driver = db.prepare('SELECT delivery_id, user_id FROM delivery_personnel WHERE is_available = 1 ORDER BY RANDOM() LIMIT 1').get();
        const delivery_person_id = driver ? driver.user_id : null;

        // Insert Order
        const resOrder = db.prepare(`
            INSERT INTO orders (customer_id, restaurant_id, delivery_person_id, delivery_address, order_status, subtotal_amount, tax_amount, delivery_fee, total_amount, notes)
            VALUES (?, ?, ?, ?, 'Placed', ?, ?, ?, ?, ?)
        `).run(customerId, cart.restaurant_id, delivery_person_id, delivery_address, subtotal, tax, deliveryFee, total, notes || null);

        const orderId = resOrder.lastInsertRowid;

        // Freeze price_at_order_time in order_items
        for (const item of cartItems) {
            db.prepare(`
                INSERT INTO order_items (order_id, item_id, quantity, price_at_order_time)
                VALUES (?, ?, ?, ?)
            `).run(orderId, item.item_id, item.quantity, item.price);
        }

        // Create Payment Record (Simulated)
        const txnRef = `TXN-${payment_method.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
        db.prepare(`
            INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_ref)
            VALUES (?, ?, 'completed', ?, ?)
        `).run(orderId, payment_method, total, txnRef);

        // Create Delivery Assignment if driver assigned
        if (driver) {
            db.prepare(`
                INSERT INTO delivery_assignments (order_id, delivery_id, status)
                VALUES (?, ?, 'Assigned')
            `).run(orderId, driver.delivery_id);
        }

        // Clear Cart
        db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.cart_id);
        db.prepare('UPDATE carts SET restaurant_id = NULL WHERE cart_id = ?').run(cart.cart_id);

        res.status(201).json({
            message: 'Order placed successfully!',
            order_id: orderId,
            total_amount: total,
            transaction_ref: txnRef
        });
    } catch (err) {
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Get User Order History
router.get('/orders/history', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const orders = db.prepare(`
            SELECT 
                o.*,
                r.name AS restaurant_name,
                r.cover_image_url AS restaurant_image,
                p.payment_method,
                p.payment_status,
                rev.rating AS user_rating,
                rev.comment AS user_review
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            LEFT JOIN reviews rev ON o.order_id = rev.order_id
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
        `).all(customerId);

        for (const order of orders) {
            order.items = db.prepare(`
                SELECT oi.*, mi.name, mi.image_url
                FROM order_items oi
                JOIN menu_items mi ON oi.item_id = mi.item_id
                WHERE oi.order_id = ?
            `).all(order.order_id);
        }

        res.json(orders);
    } catch (err) {
        console.error('Error fetching order history:', err);
        res.status(500).json({ error: 'Failed to fetch order history' });
    }
});

// Get Single Order Details & Real-Time Tracking State
router.get('/orders/:id', authenticateToken, (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const order = db.prepare(`
            SELECT 
                o.*,
                r.name AS restaurant_name,
                r.phone AS restaurant_phone,
                r.address AS restaurant_address,
                u_del.name AS delivery_driver_name,
                u_del.phone AS delivery_driver_phone,
                dp.vehicle_type,
                dp.license_plate,
                p.payment_method,
                p.payment_status,
                p.transaction_ref
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            LEFT JOIN users u_del ON o.delivery_person_id = u_del.user_id
            LEFT JOIN delivery_personnel dp ON u_del.user_id = dp.user_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE o.order_id = ?
        `).get(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Authorization check: Customer, Restaurant Admin, Delivery driver, or SuperAdmin
        const isCustomer = order.customer_id === req.user.id;
        const isAdmin = ['restaurant_admin', 'delivery', 'admin'].includes(req.user.role);
        if (!isCustomer && !isAdmin) {
            return res.status(403).json({ error: 'Unauthorized to view this order' });
        }

        order.items = db.prepare(`
            SELECT oi.*, mi.name, mi.image_url, mi.description
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.item_id
            WHERE oi.order_id = ?
        `).all(orderId);

        // Check if review exists
        order.review = db.prepare('SELECT * FROM reviews WHERE order_id = ?').get(orderId) || null;

        res.json(order);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

// Reorder past order (Adds items back to cart)
router.post('/orders/:id/reorder', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const orderId = parseInt(req.params.id);

        const order = db.prepare('SELECT * FROM orders WHERE order_id = ? AND customer_id = ?').get(orderId, customerId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = db.prepare('SELECT item_id, quantity FROM order_items WHERE order_id = ?').all(orderId);
        
        let cart = db.prepare('SELECT * FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart) {
            const resInsert = db.prepare('INSERT INTO carts (customer_id, restaurant_id) VALUES (?, ?)').run(customerId, order.restaurant_id);
            cart = db.prepare('SELECT * FROM carts WHERE cart_id = ?').get(resInsert.lastInsertRowid);
        } else {
            // Reset cart to this restaurant
            db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.cart_id);
            db.prepare('UPDATE carts SET restaurant_id = ? WHERE cart_id = ?').run(order.restaurant_id, cart.cart_id);
        }

        for (const item of items) {
            db.prepare('INSERT INTO cart_items (cart_id, item_id, quantity) VALUES (?, ?, ?)').run(cart.cart_id, item.item_id, item.quantity);
        }

        res.json({ message: 'Order items added to cart!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reorder' });
    }
});

module.exports = router;
