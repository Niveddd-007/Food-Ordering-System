const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// Get customer favorites
router.get('/favorites', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const favorites = db.prepare(`
            SELECT r.*
            FROM favorites f
            JOIN restaurants r ON f.restaurant_id = r.restaurant_id
            WHERE f.customer_id = ?
        `).all(customerId);

        res.json(favorites);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

// Toggle Favorite
router.post('/favorites/toggle', authenticateToken, (req, res) => {
    try {
        const customerId = req.user.id;
        const { restaurant_id } = req.body;

        if (!restaurant_id) {
            return res.status(400).json({ error: 'restaurant_id is required' });
        }

        const existing = db.prepare('SELECT * FROM favorites WHERE customer_id = ? AND restaurant_id = ?').get(customerId, restaurant_id);

        if (existing) {
            db.prepare('DELETE FROM favorites WHERE customer_id = ? AND restaurant_id = ?').run(customerId, restaurant_id);
            res.json({ is_favorite: false, message: 'Removed from favorites' });
        } else {
            db.prepare('INSERT INTO favorites (customer_id, restaurant_id) VALUES (?, ?)').run(customerId, restaurant_id);
            res.json({ is_favorite: true, message: 'Added to favorites' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

module.exports = router;
