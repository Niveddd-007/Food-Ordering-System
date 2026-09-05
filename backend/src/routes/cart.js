const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Get active cart for current user
router.get('/cart', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        
        let cart = db.prepare('SELECT * FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart) {
            const resInsert = db.prepare('INSERT INTO carts (customer_id) VALUES (?)').run(customerId);
            cart = db.prepare('SELECT * FROM carts WHERE cart_id = ?').get(resInsert.lastInsertRowid);
        }

        const items = db.prepare(`
            SELECT 
                ci.cart_item_id,
                ci.quantity,
                mi.item_id,
                mi.name,
                mi.description,
                mi.price,
                mi.image_url,
                mi.is_veg,
                mi.is_available,
                r.restaurant_id,
                r.name AS restaurant_name
            FROM cart_items ci
            JOIN menu_items mi ON ci.item_id = mi.item_id
            JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
            WHERE ci.cart_id = ?
        `).all(cart.cart_id);

        let restaurant = null;
        if (cart.restaurant_id) {
            restaurant = db.prepare('SELECT restaurant_id, name, delivery_time_mins FROM restaurants WHERE restaurant_id = ?').get(cart.restaurant_id);
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = +(subtotal * 0.05).toFixed(2); // 5% tax
        const deliveryFee = items.length > 0 ? 3.99 : 0.00;
        const total = +(subtotal + tax + deliveryFee).toFixed(2);

        res.json({
            cart_id: cart.cart_id,
            restaurant,
            items,
            summary: {
                subtotal: +subtotal.toFixed(2),
                tax,
                deliveryFee,
                total
            }
        });
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart (Handles single-restaurant cart restriction)
router.post('/cart/add', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const { item_id, quantity = 1 } = req.body;

        if (!item_id) {
            return res.status(400).json({ error: 'item_id is required' });
        }

        const item = db.prepare('SELECT * FROM menu_items WHERE item_id = ?').get(item_id);
        if (!item || !item.is_available) {
            return res.status(400).json({ error: 'Item not found or currently unavailable' });
        }

        let cart = db.prepare('SELECT * FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart) {
            const resInsert = db.prepare('INSERT INTO carts (customer_id, restaurant_id) VALUES (?, ?)').run(customerId, item.restaurant_id);
            cart = db.prepare('SELECT * FROM carts WHERE cart_id = ?').get(resInsert.lastInsertRowid);
        }

        // Single-restaurant check: clear cart if switching restaurant
        if (cart.restaurant_id && cart.restaurant_id !== item.restaurant_id) {
            db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.cart_id);
            db.prepare('UPDATE carts SET restaurant_id = ? WHERE cart_id = ?').run(item.restaurant_id, cart.cart_id);
        } else if (!cart.restaurant_id) {
            db.prepare('UPDATE carts SET restaurant_id = ? WHERE cart_id = ?').run(item.restaurant_id, cart.cart_id);
        }

        // Check if item already exists in cart
        const existing = db.prepare('SELECT * FROM cart_items WHERE cart_id = ? AND item_id = ?').get(cart.cart_id, item_id);
        if (existing) {
            db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?').run(quantity, existing.cart_item_id);
        } else {
            db.prepare('INSERT INTO cart_items (cart_id, item_id, quantity) VALUES (?, ?, ?)').run(cart.cart_id, item_id, quantity);
        }

        res.json({ message: 'Item added to cart successfully' });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Update item quantity
router.put('/cart/update', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const { cart_item_id, quantity } = req.body;

        const cart = db.prepare('SELECT cart_id FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        if (quantity <= 0) {
            db.prepare('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?').run(cart_item_id, cart.cart_id);
        } else {
            db.prepare('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ? AND cart_id = ?').run(quantity, cart_item_id, cart.cart_id);
        }

        // Check if cart is now empty
        const remaining = db.prepare('SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?').get(cart.cart_id).count;
        if (remaining === 0) {
            db.prepare('UPDATE carts SET restaurant_id = NULL WHERE cart_id = ?').run(cart.cart_id);
        }

        res.json({ message: 'Cart updated successfully' });
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Remove item from cart
router.delete('/cart/remove/:cart_item_id', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const cartItemId = parseInt(req.params.cart_item_id);

        const cart = db.prepare('SELECT cart_id FROM carts WHERE customer_id = ?').get(customerId);
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        db.prepare('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?').run(cartItemId, cart.cart_id);

        const remaining = db.prepare('SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?').get(cart.cart_id).count;
        if (remaining === 0) {
            db.prepare('UPDATE carts SET restaurant_id = NULL WHERE cart_id = ?').run(cart.cart_id);
        }

        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

// Clear cart
router.delete('/cart/clear', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const cart = db.prepare('SELECT cart_id FROM carts WHERE customer_id = ?').get(customerId);
        if (cart) {
            db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.cart_id);
            db.prepare('UPDATE carts SET restaurant_id = NULL WHERE cart_id = ?').run(cart.cart_id);
        }
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
