const express = require('express');
const router = express.Router();
const db = require('../db/db');

const QUERY_CATALOG = [
    {
        id: 1,
        title: 'Cuisine Search & Filtering',
        description: 'List all restaurants serving Italian cuisine, sorted by average rating and delivery time.',
        sql: `SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.avg_rating,
    r.delivery_time_mins,
    r.address,
    c.name AS cuisine_name
FROM restaurants r
JOIN restaurant_cuisines rc ON r.restaurant_id = rc.restaurant_id
JOIN cuisines c ON rc.cuisine_id = c.cuisine_id
WHERE LOWER(c.name) = 'italian' AND r.is_active = 1
ORDER BY r.avg_rating DESC, r.delivery_time_mins ASC;`
    },
    {
        id: 2,
        title: 'Customer Order History Breakdown',
        description: 'Get full order history with item details, quantities, and prices for customer_id = 1.',
        sql: `SELECT 
    o.order_id,
    r.name AS restaurant_name,
    o.order_status,
    o.total_amount,
    o.created_at AS order_date,
    GROUP_CONCAT(mi.name || ' (x' || oi.quantity || ' @ $' || oi.price_at_order_time || ')', ', ') AS ordered_items
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.restaurant_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN menu_items mi ON oi.item_id = mi.item_id
WHERE o.customer_id = 1
GROUP BY o.order_id, r.name, o.order_status, o.total_amount, o.created_at
ORDER BY o.created_at DESC;`
    },
    {
        id: 3,
        title: 'Total Revenue Per Restaurant',
        description: 'Compute total subtotal, tax, and gross revenue for completed (Delivered) orders.',
        sql: `SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    COUNT(o.order_id) AS completed_orders_count,
    SUM(o.subtotal_amount) AS net_revenue,
    SUM(o.tax_amount) AS total_tax_collected,
    SUM(o.total_amount) AS gross_revenue
FROM restaurants r
JOIN orders o ON r.restaurant_id = o.restaurant_id
WHERE o.order_status = 'Delivered'
GROUP BY r.restaurant_id, r.name
HAVING COUNT(o.order_id) > 0
ORDER BY gross_revenue DESC;`
    },
    {
        id: 4,
        title: 'Top 5 Best-Selling Menu Items',
        description: 'Find top 5 best-selling menu items across the entire platform based on quantity ordered.',
        sql: `SELECT 
    mi.item_id,
    mi.name AS item_name,
    mc.name AS category,
    r.name AS restaurant_name,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.quantity * oi.price_at_order_time) AS total_item_revenue
FROM order_items oi
JOIN menu_items mi ON oi.item_id = mi.item_id
JOIN menu_categories mc ON mi.category_id = mc.category_id
JOIN restaurants r ON mi.restaurant_id = r.restaurant_id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.order_status != 'Cancelled'
GROUP BY mi.item_id, mi.name, mc.name, r.name
ORDER BY total_units_sold DESC
LIMIT 5;`
    },
    {
        id: 5,
        title: 'Dormant / Inactive Restaurants',
        description: 'Find active restaurants that have received zero orders in the last 30 days.',
        sql: `SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.phone,
    r.created_at
FROM restaurants r
LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id 
    AND o.created_at >= DATETIME('now', '-30 days')
WHERE o.order_id IS NULL;`
    },
    {
        id: 6,
        title: 'Active Order & Delivery Personnel Tracking',
        description: 'Get current status, delivery driver details, vehicle info, and assignment timestamp for order_id = 2.',
        sql: `SELECT 
    o.order_id,
    o.order_status,
    o.delivery_address,
    o.created_at AS order_time,
    u.name AS delivery_person_name,
    u.phone AS delivery_person_phone,
    dp.vehicle_type,
    dp.license_plate,
    da.assigned_at,
    da.status AS delivery_assignment_status
FROM orders o
LEFT JOIN delivery_assignments da ON o.order_id = da.order_id
LEFT JOIN delivery_personnel dp ON da.delivery_id = dp.delivery_id
LEFT JOIN users u ON dp.user_id = u.user_id
WHERE o.order_id = 2;`
    },
    {
        id: 7,
        title: 'Calculated Average Ratings Per Restaurant',
        description: 'Compute average customer rating per restaurant dynamically using aggregate functions.',
        sql: `SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    COUNT(rev.review_id) AS total_reviews,
    COALESCE(ROUND(AVG(rev.rating), 2), 0.00) AS calculated_avg_rating,
    r.avg_rating AS stored_avg_rating
FROM restaurants r
LEFT JOIN reviews rev ON r.restaurant_id = rev.restaurant_id
GROUP BY r.restaurant_id, r.name
ORDER BY calculated_avg_rating DESC;`
    },
    {
        id: 8,
        title: 'Customers Who Have Never Placed an Order',
        description: 'Identify registered customer accounts that have never placed an order using NOT EXISTS.',
        sql: `SELECT 
    u.user_id,
    u.name,
    u.email,
    u.created_at
FROM users u
WHERE u.role = 'customer'
  AND NOT EXISTS (
      SELECT 1 FROM orders o WHERE o.customer_id = u.user_id
  );`
    },
    {
        id: 9,
        title: 'Busiest Hours of the Day',
        description: 'Group orders by hour of the day to analyze peak traffic hours and hourly revenue.',
        sql: `SELECT 
    STRFTIME('%H', created_at) || ':00 - ' || STRFTIME('%H', created_at) || ':59' AS time_window,
    COUNT(order_id) AS total_orders,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY STRFTIME('%H', created_at)
ORDER BY total_orders DESC;`
    },
    {
        id: 10,
        title: 'Most Popular Cuisine by Order Volume',
        description: 'Find the top cuisines by total number of orders placed across restaurants.',
        sql: `SELECT 
    c.cuisine_id,
    c.name AS cuisine_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_revenue
FROM cuisines c
JOIN restaurant_cuisines rc ON c.cuisine_id = rc.cuisine_id
JOIN restaurants r ON rc.restaurant_id = r.restaurant_id
JOIN orders o ON r.restaurant_id = o.restaurant_id
WHERE o.order_status != 'Cancelled'
GROUP BY c.cuisine_id, c.name
ORDER BY total_orders DESC;`
    }
];

// Get List of Demonstration Queries
router.get('/db/queries', (req, res) => {
    res.json(QUERY_CATALOG);
});

// Run specific demonstration query by ID
router.post('/db/queries/run', (req, res) => {
    try {
        const { query_id, custom_sql } = req.body;

        let sqlToRun = '';
        let queryMeta = null;

        if (query_id) {
            queryMeta = QUERY_CATALOG.find(q => q.id === parseInt(query_id));
            if (!queryMeta) {
                return res.status(404).json({ error: 'Query not found in catalog' });
            }
            sqlToRun = queryMeta.sql;
        } else if (custom_sql) {
            sqlToRun = custom_sql;
        } else {
            return res.status(400).json({ error: 'query_id or custom_sql is required' });
        }

        const startTime = Date.now();
        const results = db.prepare(sqlToRun).all();
        const executionTimeMs = Date.now() - startTime;

        res.json({
            meta: queryMeta,
            sql: sqlToRun,
            rowCount: results.length,
            executionTimeMs,
            rows: results
        });
    } catch (err) {
        console.error('Error executing DB query:', err);
        res.status(400).json({ error: err.message || 'SQL Execution Failed' });
    }
});

module.exports = router;
