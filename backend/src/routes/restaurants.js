const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Get all Cuisines
router.get('/cuisines', (req, res) => {
    try {
        const cuisines = db.prepare('SELECT * FROM cuisines ORDER BY name ASC').all();
        res.json(cuisines);
    } catch (err) {
        console.error('Error fetching cuisines:', err);
        res.status(500).json({ error: 'Failed to fetch cuisines' });
    }
});

// Search and filter restaurants
router.get('/restaurants', (req, res) => {
    try {
        const { search, cuisine_id, sort_by } = req.query;

        let sql = `
            SELECT 
                r.*,
                GROUP_CONCAT(c.name, ', ') AS cuisine_names,
                GROUP_CONCAT(c.cuisine_id) AS cuisine_ids
            FROM restaurants r
            LEFT JOIN restaurant_cuisines rc ON r.restaurant_id = rc.restaurant_id
            LEFT JOIN cuisines c ON rc.cuisine_id = c.cuisine_id
            WHERE r.is_active = 1
        `;
        const params = [];

        if (search) {
            sql += ` AND (LOWER(r.name) LIKE ? OR LOWER(r.description) LIKE ? OR LOWER(c.name) LIKE ?)`;
            const term = `%${search.toLowerCase()}%`;
            params.push(term, term, term);
        }

        if (cuisine_id) {
            sql += ` AND r.restaurant_id IN (SELECT restaurant_id FROM restaurant_cuisines WHERE cuisine_id = ?)`;
            params.push(parseInt(cuisine_id));
        }

        sql += ` GROUP BY r.restaurant_id`;

        if (sort_by === 'rating') {
            sql += ` ORDER BY r.avg_rating DESC`;
        } else if (sort_by === 'delivery_time') {
            sql += ` ORDER BY r.delivery_time_mins ASC`;
        } else {
            sql += ` ORDER BY r.avg_rating DESC, r.name ASC`;
        }

        const restaurants = db.prepare(sql).all(...params);

        // Convert string arrays
        const formatted = restaurants.map(r => ({
            ...r,
            cuisines: r.cuisine_names ? r.cuisine_names.split(', ') : [],
            cuisine_ids: r.cuisine_ids ? r.cuisine_ids.split(',').map(Number) : []
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
});

// Get single restaurant detail with categorized menu
router.get('/restaurants/:id', (req, res) => {
    try {
        const restaurantId = parseInt(req.params.id);
        const restaurant = db.prepare(`
            SELECT 
                r.*,
                GROUP_CONCAT(c.name, ', ') AS cuisine_names
            FROM restaurants r
            LEFT JOIN restaurant_cuisines rc ON r.restaurant_id = rc.restaurant_id
            LEFT JOIN cuisines c ON rc.cuisine_id = c.cuisine_id
            WHERE r.restaurant_id = ?
            GROUP BY r.restaurant_id
        `).get(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        restaurant.cuisines = restaurant.cuisine_names ? restaurant.cuisine_names.split(', ') : [];

        // Categories & Menu items
        const categories = db.prepare('SELECT * FROM menu_categories WHERE restaurant_id = ? ORDER BY sort_order ASC').all(restaurantId);
        const items = db.prepare('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY item_id ASC').all(restaurantId);

        const categorizedMenu = categories.map(cat => ({
            ...cat,
            items: items.filter(item => item.category_id === cat.category_id)
        }));

        // Uncategorized items fallback
        const categorizedIds = new Set(categories.map(c => c.category_id));
        const uncategorized = items.filter(i => !categorizedIds.has(i.category_id));
        if (uncategorized.length > 0) {
            categorizedMenu.push({
                category_id: 0,
                name: 'Other Specialties',
                sort_order: 99,
                items: uncategorized
            });
        }

        // Reviews
        const reviews = db.prepare(`
            SELECT rev.*, u.name as customer_name, u.profile_image_url
            FROM reviews rev
            JOIN users u ON rev.customer_id = u.user_id
            WHERE rev.restaurant_id = ?
            ORDER BY rev.created_at DESC
        `).all(restaurantId);

        res.json({
            restaurant,
            categories: categorizedMenu,
            reviews
        });
    } catch (err) {
        console.error('Error fetching restaurant details:', err);
        res.status(500).json({ error: 'Failed to fetch restaurant menu' });
    }
});

module.exports = router;
