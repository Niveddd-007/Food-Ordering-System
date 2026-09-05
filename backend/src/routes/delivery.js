const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get assigned deliveries for logged-in delivery driver
router.get('/delivery/assigned', authenticateToken, requireRole('delivery', 'admin'), (req, res) => {
    try {
        const userId = req.user.id;
        
        let driver = db.prepare('SELECT * FROM delivery_personnel WHERE user_id = ?').get(userId);
        if (!driver && req.user.role === 'admin') {
            driver = db.prepare('SELECT * FROM delivery_personnel LIMIT 1').get();
        }

        if (!driver) {
            return res.status(404).json({ error: 'Delivery driver profile not found' });
        }

        const assignedOrders = db.prepare(`
            SELECT 
                o.*,
                r.name AS restaurant_name,
                r.address AS restaurant_address,
                r.phone AS restaurant_phone,
                u.name AS customer_name,
                u.phone AS customer_phone,
                da.assigned_at,
                da.picked_up_at,
                da.delivered_at,
                da.status AS assignment_status
            FROM orders o
            JOIN restaurants r ON o.restaurant_id = r.restaurant_id
            JOIN users u ON o.customer_id = u.user_id
            LEFT JOIN delivery_assignments da ON o.order_id = da.order_id
            WHERE o.delivery_person_id = ? OR da.delivery_id = ?
            ORDER BY CASE WHEN o.order_status IN ('Delivered', 'Cancelled') THEN 2 ELSE 1 END, o.created_at DESC
        `).all(driver.user_id, driver.delivery_id);

        for (const order of assignedOrders) {
            order.items = db.prepare(`
                SELECT oi.*, mi.name
                FROM order_items oi
                JOIN menu_items mi ON oi.item_id = mi.item_id
                WHERE oi.order_id = ?
            `).all(order.order_id);
        }

        res.json({
            driver,
            orders: assignedOrders
        });
    } catch (err) {
        console.error('Error fetching assigned deliveries:', err);
        res.status(500).json({ error: 'Failed to fetch delivery assignments' });
    }
});

// Update delivery status
// Flow: Out for Delivery -> Delivered
router.put('/delivery/:orderId/status', authenticateToken, requireRole('delivery', 'admin'), (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const { status } = req.body;

        const validStatuses = ['Picked Up', 'Out for Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid delivery status update' });
        }

        let orderStatus = status;
        if (status === 'Picked Up') orderStatus = 'Out for Delivery';

        db.prepare('UPDATE orders SET order_status = ? WHERE order_id = ?').run(orderStatus, orderId);

        if (status === 'Picked Up' || status === 'Out for Delivery') {
            db.prepare('UPDATE delivery_assignments SET picked_up_at = CURRENT_TIMESTAMP, status = "Picked Up" WHERE order_id = ?').run(orderId);
        } else if (status === 'Delivered') {
            db.prepare('UPDATE delivery_assignments SET delivered_at = CURRENT_TIMESTAMP, status = "Delivered" WHERE order_id = ?').run(orderId);
        }

        res.json({ message: `Delivery status updated to ${status}`, order_id: orderId, new_status: orderStatus });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update delivery status' });
    }
});

module.exports = router;
