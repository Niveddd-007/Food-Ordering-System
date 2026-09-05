# Database Normalization Report (1NF, 2NF, 3NF Proof)

## 1. Executive Summary
This document provides a mathematical and logical normalization analysis for the **Online Food Ordering System** database schema. All 16 tables satisfy **Third Normal Form (3NF)** and **Boyce-Codd Normal Form (BCNF)**.

---

## 2. Normalization Definitions

- **First Normal Form (1NF)**:
  - All attributes contain atomic (indivisible) values.
  - No repeating groups or arrays stored inside single column cells.
  - Each record is uniquely identifiable by a Primary Key (PK).
- **Second Normal Form (2NF)**:
  - Table satisfies 1NF.
  - No partial functional dependencies exist: every non-prime attribute is fully functionally dependent on the *entire* Primary Key (relevant for composite PKs).
- **Third Normal Form (3NF)**:
  - Table satisfies 2NF.
  - No transitive functional dependencies exist: no non-prime attribute depends on another non-prime attribute ($X \rightarrow Y$ implies $X$ is a superkey or $Y$ is part of a candidate key).

---

## 3. Table-by-Table Normalization Proofs

### A. `users` Table
- **Primary Key**: `user_id`
- **Functional Dependencies**:
  - `user_id` $\rightarrow$ `name`, `email`, `password_hash`, `auth_provider`, `google_id`, `phone`, `role`, `profile_image_url`, `created_at`
  - `email` $\rightarrow$ `user_id` (Candidate Key)
  - `google_id` $\rightarrow$ `user_id` (Candidate Key)
- **1NF**: All attributes are scalar values (strings, numbers, timestamps). No nested arrays.
- **2NF**: Single-column PK (`user_id`), so no partial dependencies possible.
- **3NF**: All attributes directly describe the user. No transitive dependencies ($X \rightarrow Y \rightarrow Z$).

### B. `restaurants` Table
- **Primary Key**: `restaurant_id`
- **Foreign Keys**: `owner_id` $\rightarrow$ `users(user_id)`
- **Functional Dependencies**:
  - `restaurant_id` $\rightarrow$ `owner_id`, `name`, `description`, `phone`, `address`, `cover_image_url`, `logo_url`, `opening_time`, `closing_time`, `is_active`, `avg_rating`, `delivery_time_mins`
- **Why Cuisines were extracted**: Instead of storing a comma-separated string `cuisines = "Italian, Pizza"` inside `restaurants` (which violates 1NF atomicity), a normalized many-to-many junction table `restaurant_cuisines` was created.
- **3NF**: Satisfied.

### C. `restaurant_cuisines` (Junction Table)
- **Composite Primary Key**: `(restaurant_id, cuisine_id)`
- **Functional Dependencies**:
  - `(restaurant_id, cuisine_id)` $\rightarrow$ junction existence
- **2NF**: No non-key attributes exist. All candidate keys are fully dependent.
- **3NF**: Satisfied.

### D. `menu_items` Table
- **Primary Key**: `item_id`
- **Foreign Keys**: `restaurant_id`, `category_id`
- **Functional Dependencies**:
  - `item_id` $\rightarrow$ `restaurant_id`, `category_id`, `name`, `description`, `price`, `image_url`, `is_veg`, `is_available`
- **3NF**: Category names (e.g. "Wood-Fired Pizza") are NOT stored in `menu_items`. They are referenced via `category_id` to prevent transitive dependency (`item_id` $\rightarrow$ `category_id` $\rightarrow$ `category_name`).

### E. `orders` & `order_items` Tables
- **`orders` PK**: `order_id`
- **`order_items` PK**: `order_item_id` (or Composite `(order_id, item_id)`)
- **Functional Dependencies**:
  - `order_id` $\rightarrow$ `customer_id`, `restaurant_id`, `delivery_person_id`, `delivery_address`, `order_status`, `subtotal_amount`, `tax_amount`, `delivery_fee`, `total_amount`
  - `order_item_id` $\rightarrow$ `order_id`, `item_id`, `quantity`, `price_at_order_time`
- **Historical Data Integrity (Price Freezing)**:
  - If a restaurant changes the price of "Margherita Pizza" from \$14.99 to \$16.99 in `menu_items`, historical past orders must NOT change their past total!
  - Therefore, `price_at_order_time` is explicitly stored in `order_items` at the moment of order placement. This preserves 3NF data integrity without modifying historical records.

---

## 4. Summary Matrix

| Table Name | PK | FKs | 1NF | 2NF | 3NF |
|---|---|---|---|---|---|
| `users` | `user_id` | - | ✅ | ✅ | ✅ |
| `addresses` | `address_id` | `user_id` | ✅ | ✅ | ✅ |
| `cuisines` | `cuisine_id` | - | ✅ | ✅ | ✅ |
| `restaurants` | `restaurant_id` | `owner_id` | ✅ | ✅ | ✅ |
| `restaurant_cuisines` | `(restaurant_id, cuisine_id)` | `restaurant_id`, `cuisine_id` | ✅ | ✅ | ✅ |
| `menu_categories` | `category_id` | `restaurant_id` | ✅ | ✅ | ✅ |
| `menu_items` | `item_id` | `restaurant_id`, `category_id` | ✅ | ✅ | ✅ |
| `carts` | `cart_id` | `customer_id`, `restaurant_id` | ✅ | ✅ | ✅ |
| `cart_items` | `cart_item_id` | `cart_id`, `item_id` | ✅ | ✅ | ✅ |
| `orders` | `order_id` | `customer_id`, `restaurant_id`, `delivery_person_id` | ✅ | ✅ | ✅ |
| `order_items` | `order_item_id` | `order_id`, `item_id` | ✅ | ✅ | ✅ |
| `payments` | `payment_id` | `order_id` | ✅ | ✅ | ✅ |
| `delivery_personnel` | `delivery_id` | `user_id` | ✅ | ✅ | ✅ |
| `delivery_assignments` | `assignment_id` | `order_id`, `delivery_id` | ✅ | ✅ | ✅ |
| `reviews` | `review_id` | `order_id`, `customer_id`, `restaurant_id` | ✅ | ✅ | ✅ |
| `favorites` | `(customer_id, restaurant_id)` | `customer_id`, `restaurant_id` | ✅ | ✅ | ✅ |
