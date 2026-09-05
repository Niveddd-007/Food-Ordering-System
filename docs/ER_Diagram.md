# Entity-Relationship (ER) Diagram Specification

## 1. Overview
The database models an online food ordering and delivery ecosystem with 16 entities supporting customers, restaurant owners, delivery personnel, menu management, order workflows, mock payments, ratings/reviews, and customer favorites.

---

## 2. Mermaid ER Diagram

```mermaid
erDiagram
    USERS ||--o{ ADDRESSES : "has saved"
    USERS ||--o{ RESTAURANTS : "owns"
    USERS ||--o{ ORDERS : "places (Customer)"
    USERS ||--o{ DELIVERY_PERSONNEL : "is driver"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ FAVORITES : "marks"

    CUISINES ||--o{ RESTAURANT_CUISINES : "belongs to"
    RESTAURANTS ||--o{ RESTAURANT_CUISINES : "serves"
    RESTAURANTS ||--o{ MENU_CATEGORIES : "contains"
    RESTAURANTS ||--o{ MENU_ITEMS : "offers"
    RESTAURANTS ||--o{ ORDERS : "receives"
    RESTAURANTS ||--o{ REVIEWS : "rated in"

    MENU_CATEGORIES ||--o{ MENU_ITEMS : "groups"

    CARTS ||--o{ CART_ITEMS : "holds"
    USERS ||--|| CARTS : "has active"
    MENU_ITEMS ||--o{ CART_ITEMS : "added in"

    ORDERS ||--o{ ORDER_ITEMS : "contains"
    MENU_ITEMS ||--o{ ORDER_ITEMS : "ordered as"
    ORDERS ||--|| PAYMENTS : "paid via"
    ORDERS ||--|| DELIVERY_ASSIGNMENTS : "assigned to"
    DELIVERY_PERSONNEL ||--o{ DELIVERY_ASSIGNMENTS : "executes"
    ORDERS ||--o| REVIEWS : "reviewed in"

    USERS {
        int user_id PK
        string name
        string email UK
        string password_hash
        string auth_provider
        string google_id UK
        string role
    }

    RESTAURANTS {
        int restaurant_id PK
        int owner_id FK
        string name
        decimal avg_rating
        int delivery_time_mins
    }

    MENU_ITEMS {
        int item_id PK
        int restaurant_id FK
        int category_id FK
        string name
        decimal price
        boolean is_veg
    }

    ORDERS {
        int order_id PK
        int customer_id FK
        int restaurant_id FK
        int delivery_person_id FK
        string order_status
        decimal total_amount
    }

    ORDER_ITEMS {
        int order_item_id PK
        int order_id FK
        int item_id FK
        int quantity
        decimal price_at_order_time
    }

    PAYMENTS {
        int payment_id PK
        int order_id FK
        string payment_method
        string payment_status
        decimal amount
    }
```

---

## 3. Entity Descriptions & Cardinalities

1. **USERS**: Represents system actors (`customer`, `restaurant_admin`, `delivery`, `admin`).
   - `1 : N` with `ADDRESSES` (A customer can save multiple delivery addresses).
   - `1 : N` with `ORDERS` (A customer can place multiple orders).
   - `1 : 1` with `CARTS` (A customer has exactly one active cart).
2. **RESTAURANTS**: Represents food establishments managed by restaurant admins.
   - `1 : N` with `MENU_CATEGORIES` and `MENU_ITEMS`.
   - `M : N` with `CUISINES` via `RESTAURANT_CUISINES`.
3. **ORDERS & ORDER_ITEMS**: Tracks food orders.
   - `ORDER_ITEMS` is a junction table capturing `quantity` and freezing `price_at_order_time` to ensure historic accuracy when menu prices change.
4. **PAYMENTS**: Mock payment records linked 1-to-1 with orders.
5. **DELIVERY_ASSIGNMENTS**: Assigns orders to delivery drivers and logs timestamps (`assigned_at`, `picked_up_at`, `delivered_at`).
