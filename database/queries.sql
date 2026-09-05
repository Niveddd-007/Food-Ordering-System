-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM - 10 DEMONSTRATION SQL QUERIES (DBMS PROJECT)
-- ============================================================================

-- Query 1: List all restaurants serving a given cuisine (e.g., 'Italian'), sorted by rating and delivery time
-- Demonstrates: Multi-table JOINs (restaurants, restaurant_cuisines, cuisines), WHERE filtering, ORDER BY multi-column
SELECT 
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
ORDER BY r.avg_rating DESC, r.delivery_time_mins ASC;


-- Query 2: Get full order history with item details for a given customer (e.g., customer_id = 1)
-- Demonstrates: 4-table JOIN (orders, order_items, menu_items, restaurants), aggregation, price history lookup
SELECT 
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
ORDER BY o.created_at DESC;


-- Query 3: Calculate total revenue per restaurant for completed orders
-- Demonstrates: Aggregate functions (SUM, COUNT, AVG), GROUP BY, HAVING, COALESCE
SELECT 
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
ORDER BY gross_revenue DESC;


-- Query 4: Find the top 5 best-selling menu items across the platform
-- Demonstrates: Aggregation over junction table, LIMIT, multi-table JOIN
SELECT 
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
LIMIT 5;


-- Query 5: Find restaurants with no orders in the last 30 days (Dormant Restaurants)
-- Demonstrates: LEFT JOIN with NULL check / Subquery date filtering
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.phone,
    r.created_at
FROM restaurants r
LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id 
    AND o.created_at >= DATETIME('now', '-30 days')
WHERE o.order_id IS NULL;


-- Query 6: Get current status and assigned delivery person for an active order (e.g., order_id = 2)
-- Demonstrates: Complex JOIN involving optional relationships (delivery_assignments, delivery_personnel, users)
SELECT 
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
WHERE o.order_id = 2;


-- Query 7: Calculate average rating per restaurant along with review counts
-- Demonstrates: Grouping, AVG, COUNT, joining reviews table
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    COUNT(rev.review_id) AS total_reviews,
    COALESCE(ROUND(AVG(rev.rating), 2), 0.00) AS calculated_avg_rating,
    r.avg_rating AS stored_avg_rating
FROM restaurants r
LEFT JOIN reviews rev ON r.restaurant_id = rev.restaurant_id
GROUP BY r.restaurant_id, r.name
ORDER BY calculated_avg_rating DESC;


-- Query 8: Find customers who have registered but never placed an order
-- Demonstrates: Subquery with NOT EXISTS (Set difference)
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.created_at
FROM users u
WHERE u.role = 'customer'
  AND NOT EXISTS (
      SELECT 1 FROM orders o WHERE o.customer_id = u.user_id
  );


-- Query 9: Find the busiest hour of the day for orders
-- Demonstrates: Date formatting functions (STRFTIME), GROUP BY time component, aggregate ordering
SELECT 
    STRFTIME('%H', created_at) || ':00 - ' || STRFTIME('%H', created_at) || ':59' AS time_window,
    COUNT(order_id) AS total_orders,
    SUM(total_amount) AS total_revenue
FROM orders
GROUP BY STRFTIME('%H', created_at)
ORDER BY total_orders DESC;


-- Query 10: Find the most popular cuisine by total number of orders placed
-- Demonstrates: Junction table traversal across 4 tables, aggregate sorting
SELECT 
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
ORDER BY total_orders DESC;
