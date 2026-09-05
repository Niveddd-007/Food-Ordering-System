-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM - SEED DATA (DML)
-- Realistic demo data for presentation & testing
-- ============================================================================

-- 1. USERS (Password for all local users is: demo123)
-- bcrypt hash for 'demo123': $2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW
INSERT INTO users (user_id, name, email, password_hash, auth_provider, google_id, phone, role, profile_image_url) VALUES
(1, 'Customer One', 'customer1@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0101', 'customer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'),
(2, 'Sarah Jenkins', 'sarah@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0102', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'),
(3, 'Alex Mercer (Google User)', 'alex.mercer@gmail.com', NULL, 'google', 'google-oauth2-10987654321', '+1 555-0103', 'customer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'),
(4, 'Bella Italia Admin', 'admin1@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0201', 'restaurant_admin', 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=250&q=80'),
(5, 'Burger Haven Admin', 'admin2@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0202', 'restaurant_admin', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=250&q=80'),
(6, 'Spice Route Admin', 'admin3@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0203', 'restaurant_admin', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80'),
(7, 'Mike Delivery', 'delivery1@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0301', 'delivery', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'),
(8, 'David Courier', 'delivery2@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0302', 'delivery', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'),
(9, 'System SuperAdmin', 'superadmin@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0900', 'admin', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80'),
(10, 'Dormant User', 'dormant@demo.local', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'local', NULL, '+1 555-0104', 'customer', NULL);

-- 2. ADDRESSES
INSERT INTO addresses (address_id, user_id, label, street_address, city, state, postal_code, is_default) VALUES
(1, 1, 'Home', '742 Evergreen Terrace', 'Springfield', 'OR', '97477', 1),
(2, 1, 'Work', '100 Industrial Parkway, Suite 400', 'Springfield', 'OR', '97477', 0),
(3, 2, 'Apartment', '124 Conch Street', 'Bikini Bottom', 'CA', '90210', 1),
(4, 3, 'Condo', '456 Ocean Avenue, Apt 12B', 'Seattle', 'WA', '98101', 1);

-- 3. CUISINES
INSERT INTO cuisines (cuisine_id, name, image_url) VALUES
(1, 'Italian', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'),
(2, 'American / Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'),
(3, 'Indian', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80'),
(4, 'Japanese / Sushi', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=80'),
(5, 'Mexican', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80'),
(6, 'Thai', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=400&q=80');

-- 4. RESTAURANTS
INSERT INTO restaurants (restaurant_id, owner_id, name, description, phone, address, cover_image_url, logo_url, opening_time, closing_time, is_active, avg_rating, delivery_time_mins) VALUES
(1, 4, 'Bella Italia Trattoria', 'Authentic wood-fired pizzas, handmade pastas, and classic Italian desserts made fresh daily.', '+1 555-7001', '128 Via Roma Way, Downtown', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80', '10:00', '22:30', 1, 4.85, 25),
(2, 5, 'Burger Haven & Grill', 'Smash burgers, crispy seasoned fries, thick milkshakes, and artisanal craft sides.', '+1 555-7002', '454 Main Street, West End', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80', '11:00', '23:00', 1, 4.60, 20),
(3, 6, 'Spice Route Indian Bistro', 'Rich aromatic curries, tandoori specialties, warm garlic naan, and authentic biryanis.', '+1 555-7003', '89 Curry Lane, Little India', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=150&q=80', '11:30', '22:00', 1, 4.75, 30),
(4, 4, 'Sakura Sushi Bar', 'Fresh sashimi, signature sushi rolls, ramen bowls, and Japanese tempura.', '+1 555-7004', '302 Cherry Blossom Blvd', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=150&q=80', '12:00', '22:30', 1, 4.90, 35),
(5, 5, 'El Mariachi Taco House', 'Street-style tacos, stuffed burritos, fresh guacamole, and churros.', '+1 555-7005', '77 Fiesta Plaza, Southside', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=150&q=80', '10:30', '23:00', 1, 4.50, 25);

-- 5. RESTAURANT_CUISINES
INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id) VALUES
(1, 1), -- Bella Italia -> Italian
(2, 2), -- Burger Haven -> American / Burgers
(3, 3), -- Spice Route -> Indian
(4, 4), -- Sakura Sushi -> Japanese
(5, 5); -- El Mariachi -> Mexican

-- 6. MENU CATEGORIES
INSERT INTO menu_categories (category_id, restaurant_id, name, sort_order) VALUES
-- Bella Italia
(1, 1, 'Wood-Fired Pizza', 1),
(2, 1, 'Fresh Pasta', 2),
(3, 1, 'Desserts & Drinks', 3),
-- Burger Haven
(4, 2, 'Signature Burgers', 1),
(5, 2, 'Sides & Fries', 2),
(6, 2, 'Shakes & Beverages', 3),
-- Spice Route
(7, 3, 'Appetizers & Tandoor', 1),
(8, 3, 'Curries & Classics', 2),
(9, 3, 'Breads & Rice', 3),
-- Sakura Sushi
(10, 4, 'Specialty Rolls', 1),
(11, 4, 'Ramen & Bowls', 2),
-- El Mariachi
(12, 5, 'Tacos & Burritos', 1);

-- 7. MENU ITEMS
INSERT INTO menu_items (item_id, restaurant_id, category_id, name, description, price, image_url, is_available, is_veg) VALUES
-- Bella Italia (Rest 1)
(1, 1, 1, 'Margherita Superiore', 'San Marzano tomatoes, fresh mozzarella di bufala, basil, extra virgin olive oil.', 14.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80', 1, 1),
(2, 1, 1, 'Pepperoni & Hot Honey Pizza', 'Spicy pepperoni, mozzarella, crushed red pepper, drizzled with artisanal hot honey.', 16.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80', 1, 0),
(3, 1, 1, 'Truffle Mushroom Pizza', 'Wild mushrooms, black truffle cream, fontina, caramelized onions, fresh thyme.', 18.50, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', 1, 1),
(4, 1, 2, 'Fettuccine Alfredo with Chicken', 'Handmade fettuccine tossed in rich parmesan cream sauce with grilled chicken breast.', 15.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80', 1, 0),
(5, 1, 2, 'Penne Alla Vodka', 'Penne pasta in a velvety tomato cream vodka sauce with fresh parmesan.', 13.99, 'https://images.unsplash.com/photo-1621996346565-e3def616403c?auto=format&fit=crop&w=500&q=80', 1, 1),
(6, 1, 3, 'Classic Tiramisu', 'Espresso-soaked ladyfingers, whipped mascarpone cream, cocoa powder dust.', 6.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80', 1, 1),

-- Burger Haven (Rest 2)
(7, 2, 4, 'Classic Double Smash Cheeseburger', 'Two 100% Angus beef patties, American cheese, special sauce, pickles, brioche bun.', 11.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', 1, 0),
(8, 2, 4, 'Bacon Avocado Burger', 'Smoked bacon, fresh avocado, pepper jack cheese, Chipotle aioli, toasted bun.', 13.49, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', 1, 0),
(9, 2, 4, 'Beyond Veggie Deluxe', 'Plant-based patty, vegan cheddar, butter lettuce, tomato, house vegan aioli.', 12.99, 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=500&q=80', 1, 1),
(10, 2, 5, 'Loaded Truffle Fries', 'Crispy fries tossed in truffle oil, parmesan, garlic herbs, served with garlic aioli.', 6.49, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80', 1, 1),
(11, 2, 6, 'Salted Caramel Milkshake', 'Creamy vanilla ice cream blended with salted caramel drizzle and whipped cream.', 5.99, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80', 1, 1),

-- Spice Route (Rest 3)
(12, 3, 7, 'Samosa Platter (3 pcs)', 'Crispy pastry filled with spiced potatoes and peas, served with mint & tamarind chutneys.', 6.99, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80', 1, 1),
(13, 3, 8, 'Butter Chicken (Murgh Makhani)', 'Tender tandoori chicken simmered in a rich tomato, butter, and cashew gravy.', 16.49, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=500&q=80', 1, 0),
(14, 3, 8, 'Paneer Tikka Masala', 'Charbroiled cottage cheese cubes cooked in a spiced onion tomato gravy.', 14.99, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80', 1, 1),
(15, 3, 9, 'Garlic Butter Naan', 'Freshly baked tandoori bread brushed with melted butter and roasted garlic.', 3.49, 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=500&q=80', 1, 1),
(16, 3, 9, 'Hyderabadi Chicken Biryani', 'Fragrant basmati rice layered with marinated chicken, saffron, and aromatic spices.', 17.99, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80', 1, 0),

-- Sakura Sushi (Rest 4)
(17, 4, 10, 'Dragon Sushi Roll', 'Eel, cucumber, avocado overlay, unagi sauce, tobiko, sesame seeds.', 15.99, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80', 1, 0),
(18, 4, 11, 'Tonkotsu Pork Ramen', 'Rich pork bone broth, chashu pork, soft-boiled ajitama egg, bamboo shoots, scallions.', 14.99, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80', 1, 0),

-- El Mariachi (Rest 5)
(19, 5, 12, 'Street Tacos Trio', 'Choice of Carne Asada, Al Pastor, or Chicken with cilantro, diced onions, salsa verde.', 11.49, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80', 1, 0);

-- 8. CARTS
INSERT INTO carts (cart_id, customer_id, restaurant_id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, NULL);

-- 9. CART ITEMS
INSERT INTO cart_items (cart_item_id, cart_id, item_id, quantity) VALUES
(1, 1, 1, 2), -- Customer 1 has 2x Margherita Pizza
(2, 1, 6, 1), -- Customer 1 has 1x Tiramisu
(3, 2, 7, 1); -- Customer 2 has 1x Smash Burger

-- 10. ORDERS
INSERT INTO orders (order_id, customer_id, restaurant_id, delivery_person_id, delivery_address, order_status, subtotal_amount, tax_amount, delivery_fee, total_amount, notes, created_at) VALUES
(1, 1, 1, 7, '742 Evergreen Terrace, Springfield, OR', 'Delivered', 36.97, 1.85, 3.99, 42.81, 'Please leave at front door ring bell.', DATETIME('now', '-2 days')),
(2, 2, 2, 7, '124 Conch Street, Bikini Bottom, CA', 'Out for Delivery', 24.47, 1.22, 3.99, 29.68, 'Extra ketchup packets please!', DATETIME('now', '-45 minutes')),
(3, 3, 3, 8, '456 Ocean Avenue, Apt 12B, Seattle, WA', 'Preparing', 34.97, 1.75, 3.99, 40.71, 'Make it extra spicy!', DATETIME('now', '-20 minutes')),
(4, 1, 4, 8, '742 Evergreen Terrace, Springfield, OR', 'Delivered', 30.98, 1.55, 3.99, 36.52, NULL, DATETIME('now', '-5 days')),
(5, 2, 1, 7, '124 Conch Street, Bikini Bottom, CA', 'Delivered', 16.99, 0.85, 3.99, 21.83, NULL, DATETIME('now', '-10 days'));

-- 11. ORDER ITEMS
INSERT INTO order_items (order_item_id, order_id, item_id, quantity, price_at_order_time) VALUES
-- Order 1 (Customer 1 @ Bella Italia)
(1, 1, 1, 2, 14.99),
(2, 1, 6, 1, 6.99),
-- Order 2 (Customer 2 @ Burger Haven)
(3, 2, 7, 1, 11.99),
(4, 2, 10, 1, 6.49),
(5, 2, 11, 1, 5.99),
-- Order 3 (Customer 3 @ Spice Route)
(6, 3, 13, 1, 16.49),
(7, 3, 15, 2, 3.49),
(8, 3, 16, 1, 11.50),
-- Order 4 (Customer 1 @ Sakura Sushi)
(9, 4, 17, 1, 15.99),
(10, 4, 18, 1, 14.99),
-- Order 5 (Customer 2 @ Bella Italia)
(11, 5, 2, 1, 16.99);

-- 12. PAYMENTS
INSERT INTO payments (payment_id, order_id, payment_method, payment_status, amount, transaction_ref) VALUES
(1, 1, 'card', 'completed', 42.81, 'TXN-CARD-99887711'),
(2, 2, 'upi', 'completed', 29.68, 'TXN-UPI-88776622'),
(3, 3, 'card', 'completed', 40.71, 'TXN-CARD-77665533'),
(4, 4, 'cod', 'completed', 36.52, 'TXN-COD-66554444'),
(5, 5, 'card', 'completed', 21.83, 'TXN-CARD-55443355');

-- 13. DELIVERY PERSONNEL
INSERT INTO delivery_personnel (delivery_id, user_id, vehicle_type, license_plate, is_available, current_lat, current_lng) VALUES
(1, 7, 'Honda Scooter', 'OR-DLV-401', 1, 44.0462, -123.0220),
(2, 8, 'Yamaha Motorbike', 'WA-DLV-802', 1, 47.6062, -122.3321);

-- 14. DELIVERY ASSIGNMENTS
INSERT INTO delivery_assignments (assignment_id, order_id, delivery_id, assigned_at, picked_up_at, delivered_at, status) VALUES
(1, 1, 1, DATETIME('now', '-2 days'), DATETIME('now', '-2 days', '+15 minutes'), DATETIME('now', '-2 days', '+35 minutes'), 'Delivered'),
(2, 2, 1, DATETIME('now', '-40 minutes'), DATETIME('now', '-20 minutes'), NULL, 'Picked Up'),
(3, 3, 2, DATETIME('now', '-15 minutes'), NULL, NULL, 'Assigned'),
(4, 4, 2, DATETIME('now', '-5 days'), DATETIME('now', '-5 days', '+10 minutes'), DATETIME('now', '-5 days', '+30 minutes'), 'Delivered'),
(5, 5, 1, DATETIME('now', '-10 days'), DATETIME('now', '-10 days', '+12 minutes'), DATETIME('now', '-10 days', '+32 minutes'), 'Delivered');

-- 15. REVIEWS
INSERT INTO reviews (review_id, order_id, customer_id, restaurant_id, rating, comment) VALUES
(1, 1, 1, 1, 5, 'Absolutely heavenly pizza! Crisp crust, high quality cheese. Will order again!'),
(2, 4, 1, 4, 5, 'Super fresh sushi rolls and hot ramen broth. Arrived fast!'),
(3, 5, 2, 1, 4, 'Hot honey pepperoni pizza was delicious, slight delay in delivery but great food.');

-- 16. FAVORITES
INSERT INTO favorites (customer_id, restaurant_id) VALUES
(1, 1),
(1, 4),
(2, 2),
(3, 3);
