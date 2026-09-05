const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get Restaurant Admin Dashboard statistics & live order queue
router.get('/admin/dashboard', authenticateToken, requireRole('restaurant_admin', 'admin'), (req, res) => {
    try {
        let restaurant = null;
        if (req.user.role === 'restaurant_admin') {
            restaurant = db.prepare('SELECT * FROM restaurants WHERE owner_id = ?').get(req.user.id);
        } else {
            restaurant = db.prepare('SELECT * FROM restaurants ORDER BY restaurant_id ASC LIMIT 1').get();
        }

        if (!restaurant) {
            return res.status(404).json({ error: 'No restaurant associated with this admin account' });
        }

        const restaurantId = restaurant.restaurant_id;

        // Sales summary from View or Direct Query
        const salesSummary = db.prepare('SELECT * FROM v_restaurant_sales_summary WHERE restaurant_id = ?').get(restaurantId) || {
            total_orders_placed: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            net_subtotal_revenue: 0,
            gross_total_revenue: 0,
            avg_order_value: 0
        };

        // Active Orders Queue
        const activeOrders = db.prepare(`
            SELECT 
                o.*,
                u.name AS customer_name,
                u.phone AS customer_phone
            FROM orders o
            JOIN users u ON o.customer_id = u.user_id
            WHERE o.restaurant_id = ? AND o.order_status NOT IN ('Delivered', 'Cancelled')
            ORDER BY o.created_at DESC
        `).all(restaurantId);

        for (const order of activeOrders) {
            order.items = db.prepare(`
                SELECT oi.*, mi.name
                FROM order_items oi
                JOIN menu_items mi ON oi.item_id = mi.item_id
                WHERE oi.order_id = ?
            `).all(order.order_id);
        }

        // Top Selling items for this restaurant
        const topItems = db.prepare(`
            SELECT 
                mi.name,
                SUM(oi.quantity) as units_sold,
                SUM(oi.quantity * oi.price_at_order_time) as total_revenue
            FROM order_items oi
            JOIN menu_items mi ON oi.item_id = mi.item_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE mi.restaurant_id = ? AND o.order_status != 'Cancelled'
            GROUP BY mi.item_id, mi.name
            ORDER BY units_sold DESC
            LIMIT 5
        `).all(restaurantId);

        res.json({
            restaurant,
            stats: salesSummary,
            activeOrders,
            topItems
        });
    } catch (err) {
        console.error('Error fetching admin dashboard:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Update Order Status (Restaurant Admin & SuperAdmin)
// Flow: Placed -> Accepted -> Preparing -> Ready for Pickup -> Out for Delivery -> Delivered
router.put('/admin/orders/:id/status', authenticateToken, requireRole('restaurant_admin', 'admin', 'delivery'), (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid order status' });
        }

        const order = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        db.prepare('UPDATE orders SET order_status = ? WHERE order_id = ?').run(status, orderId);

        // Auto update delivery assignment timestamp if transition occurs
        if (status === 'Out for Delivery') {
            db.prepare('UPDATE delivery_assignments SET picked_up_at = CURRENT_TIMESTAMP, status = "Picked Up" WHERE order_id = ?').run(orderId);
        } else if (status === 'Delivered') {
            db.prepare('UPDATE delivery_assignments SET delivered_at = CURRENT_TIMESTAMP, status = "Delivered" WHERE order_id = ?').run(orderId);
        }

        res.json({ message: `Order status updated to ${status}`, order_id: orderId, new_status: status });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Manage Menu Items (CRUD)
router.get('/admin/menu', authenticateToken, requireRole('restaurant_admin', 'admin'), (req, res) => {
    try {
        let restaurant = null;
        if (req.user.role === 'restaurant_admin') {
            restaurant = db.prepare('SELECT restaurant_id FROM restaurants WHERE owner_id = ?').get(req.user.id);
        } else {
            restaurant = db.prepare('SELECT restaurant_id FROM restaurants LIMIT 1').get();
        }

        if (!restaurant) return res.status(404).json({ error: 'No restaurant found' });

        const items = db.prepare(`
            SELECT mi.*, mc.name as category_name
            FROM menu_items mi
            JOIN menu_categories mc ON mi.category_id = mc.category_id
            WHERE mi.restaurant_id = ?
            ORDER BY mi.item_id DESC
        `).all(restaurant.restaurant_id);

        const categories = db.prepare('SELECT * FROM menu_categories WHERE restaurant_id = ?').all(restaurant.restaurant_id);

        res.json({ items, categories, restaurant_id: restaurant.restaurant_id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// Add Menu Item
router.post('/admin/menu', authenticateToken, requireRole('restaurant_admin', 'admin'), (req, res) => {
    try {
        const { restaurant_id, category_id, name, description, price, image_url, is_veg, is_available } = req.body;

        if (!name || !price || !category_id || !restaurant_id) {
            return res.status(400).json({ error: 'Name, price, category, and restaurant ID are required' });
        }

        const result = db.prepare(`
            INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_veg, is_available)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(restaurant_id, category_id, name, description || '', price, image_url || null, is_veg ? 1 : 0, is_available !== undefined ? (is_available ? 1 : 0) : 1);

        res.status(201).json({ message: 'Menu item created successfully', item_id: result.lastInsertRowid });
    } catch (err) {
        console.error('Error creating menu item:', err);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});

// Update Menu Item
router.put('/admin/menu/:id', authenticateToken, requireRole('restaurant_admin', 'admin'), (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        const { name, description, price, image_url, is_veg, is_available, category_id } = req.body;

        db.prepare(`
            UPDATE menu_items
            SET name = COALESCE(?, name),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                image_url = COALESCE(?, image_url),
                is_veg = COALESCE(?, is_veg),
                is_available = COALESCE(?, is_available),
                category_id = COALESCE(?, category_id)
            WHERE item_id = ?
        `).run(name, description, price, image_url, is_veg !== undefined ? (is_veg ? 1 : 0) : null, is_available !== undefined ? (is_available ? 1 : 0) : null, category_id, itemId);

        res.json({ message: 'Menu item updated' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

// Delete Menu Item
router.delete('/admin/menu/:id', authenticateToken, requireRole('restaurant_admin', 'admin'), (req, res) => {
    try {
        const itemId = parseInt(req.params.id);
        db.prepare('DELETE FROM menu_items WHERE item_id = ?').run(itemId);
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router;
