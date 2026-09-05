-- ============================================================================
-- ONLINE FOOD ORDERING SYSTEM - DATABASE TRIGGERS
-- ============================================================================

-- 1. TRIGGER: RECALCULATE RESTAURANT AVERAGE RATING ON NEW REVIEW
DROP TRIGGER IF EXISTS trg_review_insert_rating;
CREATE TRIGGER trg_review_insert_rating
AFTER INSERT ON reviews
BEGIN
    UPDATE restaurants
    SET avg_rating = (
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE restaurant_id = NEW.restaurant_id
    )
    WHERE restaurant_id = NEW.restaurant_id;
END;

-- 2. TRIGGER: RECALCULATE RESTAURANT AVERAGE RATING ON REVIEW UPDATE
DROP TRIGGER IF EXISTS trg_review_update_rating;
CREATE TRIGGER trg_review_update_rating
AFTER UPDATE ON reviews
BEGIN
    UPDATE restaurants
    SET avg_rating = (
        SELECT ROUND(AVG(rating), 2)
        FROM reviews
        WHERE restaurant_id = NEW.restaurant_id
    )
    WHERE restaurant_id = NEW.restaurant_id;
END;

-- 3. TRIGGER: UPDATE ORDER UPDATED_AT TIMESTAMP ON STATUS CHANGE
DROP TRIGGER IF EXISTS trg_order_update_timestamp;
CREATE TRIGGER trg_order_update_timestamp
AFTER UPDATE OF order_status ON orders
BEGIN
    UPDATE orders
    SET updated_at = CURRENT_TIMESTAMP
    WHERE order_id = NEW.order_id;
END;
