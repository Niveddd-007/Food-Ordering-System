-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM - DATABASE DDL SCHEMA (3NF Normalized)
-- Database Engine: SQLite / PostgreSQL Compatible
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL, -- Nullable for Google OAuth users
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (auth_provider IN ('local', 'google')),
    google_id VARCHAR(255) UNIQUE NULL,
    phone VARCHAR(20) NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'restaurant_admin', 'delivery', 'admin')),
    profile_image_url TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    address_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    label VARCHAR(50) NOT NULL DEFAULT 'Home', -- Home, Work, Other
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. CUISINES TABLE
CREATE TABLE IF NOT EXISTS cuisines (
    cuisine_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    image_url TEXT NULL
);

-- 4. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    cover_image_url TEXT NULL,
    logo_url TEXT NULL,
    opening_time VARCHAR(10) DEFAULT '09:00',
    closing_time VARCHAR(10) DEFAULT '23:00',
    is_active BOOLEAN DEFAULT 1,
    avg_rating DECIMAL(3,2) DEFAULT 0.0,
    delivery_time_mins INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE RESTRICT
);

-- 5. RESTAURANT_CUISINES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS restaurant_cuisines (
    restaurant_id INTEGER NOT NULL,
    cuisine_id INTEGER NOT NULL,
    PRIMARY KEY (restaurant_id, cuisine_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (cuisine_id) REFERENCES cuisines(cuisine_id) ON DELETE CASCADE
);

-- 6. MENU_CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS menu_categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 7. MENU_ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT NULL,
    is_available BOOLEAN DEFAULT 1,
    is_veg BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(category_id) ON DELETE RESTRICT
);

-- 8. CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL UNIQUE,
    restaurant_id INTEGER NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE SET NULL
);

-- 9. CART_ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
    cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE CASCADE
);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    delivery_person_id INTEGER NULL,
    delivery_address TEXT NOT NULL,
    order_status VARCHAR(30) NOT NULL DEFAULT 'Placed' 
        CHECK (order_status IN ('Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled')),
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE RESTRICT,
    FOREIGN KEY (delivery_person_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 11. ORDER_ITEMS TABLE (Junction with price freeze)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_order_time DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id) ON DELETE RESTRICT
);

-- 12. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('card', 'upi', 'cod')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    amount DECIMAL(10,2) NOT NULL,
    transaction_ref VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- 13. DELIVERY_PERSONNEL TABLE
CREATE TABLE IF NOT EXISTS delivery_personnel (
    delivery_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) DEFAULT 'Motorbike',
    license_plate VARCHAR(30) NULL,
    is_available BOOLEAN DEFAULT 1,
    current_lat DECIMAL(9,6) NULL,
    current_lng DECIMAL(9,6) NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 14. DELIVERY_ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS delivery_assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    delivery_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    picked_up_at DATETIME NULL,
    delivered_at DATETIME NULL,
    status VARCHAR(30) DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Picked Up', 'Delivered', 'Cancelled')),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_id) REFERENCES delivery_personnel(delivery_id) ON DELETE RESTRICT
);

-- 15. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- 16. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, restaurant_id),
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active, avg_rating);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
