const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Submit Review for an Order (Triggers rating recalculation automatically!)
router.post('/reviews', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const { order_id, rating, comment } = req.body;

        if (!order_id || !rating) {
            return res.status(400).json({ error: 'order_id and rating (1-5) are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
        }

        const order = db.prepare('SELECT * FROM orders WHERE order_id = ? AND customer_id = ?').get(order_id, customerId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.order_status !== 'Delivered') {
            return res.status(400).json({ error: 'You can only review delivered orders' });
        }

        const existing = db.prepare('SELECT review_id FROM reviews WHERE order_id = ?').get(order_id);
        if (existing) {
            db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE order_id = ?').run(rating, comment || null, order_id);
        } else {
            db.prepare(`
                INSERT INTO reviews (order_id, customer_id, restaurant_id, rating, comment)
                VALUES (?, ?, ?, ?, ?)
            `).run(order_id, customerId, order.restaurant_id, rating, comment || null);
        }

        const updatedRest = db.prepare('SELECT avg_rating FROM restaurants WHERE restaurant_id = ?').get(order.restaurant_id);

        res.status(201).json({
            message: 'Review submitted successfully!',
            updated_restaurant_rating: updatedRest ? updatedRest.avg_rating : null
        });
    } catch (err) {
        console.error('Error submitting review:', err);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

module.exports = router;
