const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Place Order (Wrapped in explicit ACID transaction with coupon support)
router.post('/orders', authenticateToken, (req, res) => {
    let inTransaction = false;
    try {
        const customerId = req.user.id;
        const { delivery_address, payment_method, notes, coupon_code } = req.body;

        if (!delivery_address || !payment_method) {
            return res.status(400).json({ error: 'Delivery address and payment method are required' });
        }

        const cart = db.prepare('SELECT * FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart || !cart.restaurant_id) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        const rawCartItems = db.prepare(`
            SELECT ci.*, mi.name as item_name, mi.price as base_price, mi.is_available
            FROM cart_items ci
            JOIN menu_items mi ON ci.item_id = mi.item_id
            WHERE ci.cart_id = ?
        `).all(cart.cart_id);

        if (rawCartItems.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty' });
        }

        // Check availability
        const unavailable = rawCartItems.find(item => !item.is_available);
        if (unavailable) {
            return res.status(400).json({ error: `Item "${unavailable.item_name}" is currently out of stock` });
        }

        // Calculate itemized pricing with variants and add-ons
        const cartItems = rawCartItems.map(item => {
            let adjustedPrice = Number(item.base_price);
            if (item.selected_variant) {
                try {
                    const v = typeof item.selected_variant === 'string' ? JSON.parse(item.selected_variant) : item.selected_variant;
                    if (v && v.price_adjustment) adjustedPrice += Number(v.price_adjustment);
                } catch (e) {}
            }
            if (item.selected_addons) {
                try {
                    const addons = typeof item.selected_addons === 'string' ? JSON.parse(item.selected_addons) : item.selected_addons;
                    if (Array.isArray(addons)) {
                        for (const a of addons) {
                            if (a && a.price) adjustedPrice += Number(a.price);
                        }
                    }
                } catch (e) {}
            }
            return {
                ...item,
                final_item_price: +(adjustedPrice.toFixed(2))
            };
        });

        const subtotal = +(cartItems.reduce((sum, item) => sum + (item.final_item_price * item.quantity), 0).toFixed(2));

        // Validate and apply coupon if provided
        let discountAmount = 0.00;
        let validCoupon = null;

        if (coupon_code) {
            validCoupon = db.prepare(`
                SELECT * FROM coupons
                WHERE UPPER(code) = UPPER(?) AND is_active = 1
            `).get(coupon_code.trim());

            if (validCoupon) {
                const today = new Date().toISOString().split('T')[0];
                if (validCoupon.expiry_date >= today && validCoupon.used_count < validCoupon.usage_limit && subtotal >= validCoupon.min_order_amount) {
                    if (validCoupon.discount_type === 'percentage') {
                        discountAmount = (subtotal * validCoupon.discount_value) / 100;
                        if (validCoupon.max_discount && discountAmount > validCoupon.max_discount) {
                            discountAmount = validCoupon.max_discount;
                        }
                    } else if (validCoupon.discount_type === 'flat') {
                        discountAmount = Math.min(validCoupon.discount_value, subtotal);
                    }
                    discountAmount = +(discountAmount.toFixed(2));
                }
            }
        }

        const discountedSubtotal = Math.max(0, subtotal - discountAmount);
        const tax = +(discountedSubtotal * 0.05).toFixed(2);
        const deliveryFee = 3.99;
        const total = +(discountedSubtotal + tax + deliveryFee).toFixed(2);

        // Assign Available Delivery Driver if possible
        const driver = db.prepare('SELECT delivery_id, user_id FROM delivery_personnel WHERE is_available = 1 ORDER BY RANDOM() LIMIT 1').get();
        const delivery_person_id = driver ? driver.user_id : null;

        // BEGIN EXPLICIT ACID TRANSACTION
        db.exec('BEGIN TRANSACTION;');
        inTransaction = true;

        // 1. Insert Order
        const resOrder = db.prepare(`
            INSERT INTO orders (customer_id, restaurant_id, delivery_person_id, delivery_address, order_status, subtotal_amount, tax_amount, delivery_fee, discount_amount, coupon_code, total_amount, notes)
            VALUES (?, ?, ?, ?, 'Placed', ?, ?, ?, ?, ?, ?, ?)
        `).run(
            customerId,
            cart.restaurant_id,
            delivery_person_id,
            delivery_address,
            subtotal,
            tax,
            deliveryFee,
            discountAmount,
            validCoupon ? validCoupon.code : null,
            total,
            notes || null
        );

        const orderId = resOrder.lastInsertRowid;

        // 2. Insert Order Items (with frozen price, variant & addons)
        for (const item of cartItems) {
            db.prepare(`
                INSERT INTO order_items (order_id, item_id, quantity, price_at_order_time, selected_variant, selected_addons)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(orderId, item.item_id, item.quantity, item.final_item_price, item.selected_variant, item.selected_addons);
        }

        // 3. Create Payment Record
        const txnRef = `TXN-${payment_method.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
        db.prepare(`
            INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_ref)
            VALUES (?, ?, 'completed', ?, ?)
        `).run(orderId, payment_method, total, txnRef);

        // 4. Create Delivery Assignment if driver assigned
        if (driver) {
            db.prepare(`
                INSERT INTO delivery_assignments (order_id, delivery_id, status)
                VALUES (?, ?, 'Assigned')
            `).run(orderId, driver.delivery_id);
        }

        // 5. Update coupon usage if applied
        if (validCoupon) {
            db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = ?').run(validCoupon.coupon_id);
        }

        // 6. Clear Cart
        db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.cart_id);
        db.prepare('UPDATE carts SET restaurant_id = NULL WHERE cart_id = ?').run(cart.cart_id);

        // COMMIT TRANSACTION
        db.exec('COMMIT;');
        inTransaction = false;

        res.status(201).json({
            message: 'Order placed successfully!',
            order_id: orderId,
            subtotal,
            discount_amount: discountAmount,
            total_amount: total,
            transaction_ref: txnRef,
            coupon_applied: validCoupon ? validCoupon.code : null
        });
    } catch (err) {
        if (inTransaction) {
            try { db.exec('ROLLBACK;'); } catch (rbErr) {}
        }
        console.error('Error placing order:', err);
        res.status(500).json({ error: 'Failed to place order: ' + err.message });
    }
});

// Get User Order History (with optional search/filter)
router.get('/orders/history', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const { search, status } = req.query;

        let sql = `
            SELECT 
                o.*,
                r.name AS restaurant_name,
                r.cover_image_url AS restaurant_image,
                p.payment_method,
                p.payment_status,
                p.transaction_ref,
                rev.rating AS user_rating,
                rev.comment AS user_review
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            LEFT JOIN reviews rev ON o.order_id = rev.order_id
            WHERE o.customer_id = ?
        `;
        const params = [customerId];

        if (status && status !== 'all') {
            sql += ` AND o.order_status = ?`;
            params.push(status);
        }

        if (search) {
            sql += ` AND (r.name LIKE ? OR o.order_id LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ` ORDER BY o.created_at DESC`;

        const orders = db.prepare(sql).all(...params);

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
                p.payment_method,
                p.payment_status,
                p.transaction_ref,
                dp.vehicle_type,
                dp.license_plate,
                u_deliv.name AS driver_name,
                u_deliv.phone AS driver_phone,
                u_cust.name AS customer_name,
                u_cust.email AS customer_email,
                u_cust.phone AS customer_phone
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            JOIN users u_cust ON o.customer_id = u_cust.user_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            LEFT JOIN delivery_assignments da ON o.order_id = da.order_id
            LEFT JOIN delivery_personnel dp ON da.delivery_id = dp.delivery_id
            LEFT JOIN users u_deliv ON dp.user_id = u_deliv.user_id
            WHERE o.order_id = ?
        `).get(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.items = db.prepare(`
            SELECT oi.*, mi.name, mi.image_url, mi.description
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.item_id
            WHERE oi.order_id = ?
        `).all(orderId);

        res.json(order);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

// Reorder past order into cart
router.post('/orders/:id/reorder', authenticateToken, (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const customerId = req.user.id;

        const pastOrder = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
        if (!pastOrder) return res.status(404).json({ error: 'Past order not found' });

        const pastItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

        let cart = db.prepare('SELECT * FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart) {
            const resC = db.prepare('INSERT INTO carts (customer_id, restaurant_id) VALUES (?, ?)').run(customerId, pastOrder.restaurant_id);
            cart = db.prepare('SELECT * FROM carts WHERE cart_id = ?').get(resC.lastInsertRowid);
        } else {
            db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.cart_id);
            db.prepare('UPDATE carts SET restaurant_id = ? WHERE cart_id = ?').run(pastOrder.restaurant_id, cart.cart_id);
        }

        for (const item of pastItems) {
            db.prepare('INSERT INTO cart_items (cart_id, item_id, quantity, selected_variant, selected_addons) VALUES (?, ?, ?, ?, ?)').run(
                cart.cart_id,
                item.item_id,
                item.quantity,
                item.selected_variant || null,
                item.selected_addons || null
            );
        }

        res.json({ message: 'Items added to cart successfully!' });
    } catch (err) {
        console.error('Error reordering:', err);
        res.status(500).json({ error: 'Failed to reorder' });
    }
});

module.exports = router;
