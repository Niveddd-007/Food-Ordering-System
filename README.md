# Online Food Ordering System — DBMS Group Project

A complete, full-stack, 3NF normalized **Online Food Ordering & Delivery System** designed for a **Database Management Systems (DBMS) course project**.

Built with **React 18 + Vite + TypeScript + Tailwind CSS** on the frontend, **Node.js + Express** on the backend, and **SQLite (sql.js / better-sqlite3)** enforcing raw SQL schema, constraints, views, and triggers.

---

## 🌟 Key Features

### 1. 3NF Relational Database Schema
- **16 Tables**: `users`, `addresses`, `cuisines`, `restaurants`, `restaurant_cuisines`, `menu_categories`, `menu_items`, `carts`, `cart_items`, `orders`, `order_items`, `payments`, `delivery_personnel`, `delivery_assignments`, `reviews`, `favorites`.
- **Database Engine Features**: Foreign Key CASCADE/RESTRICT/SET NULL constraints, CHECK constraints, Indexes on frequently queried columns, Views (`v_restaurant_sales_summary`, `v_top_rated_menu_items`, `v_busiest_hours`, `v_popular_cuisines`), and Triggers for dynamic average rating updates.

### 2. Real Authentication System
- **Local Auth**: Registration with bcrypt password hashing (cost factor 10) and JWT sessions.
- **Google OAuth 2.0**: Real Google Identity Services Sign-In token verification via `google-auth-library` and `@react-oauth/google`.

### 3. Role-Based Interfaces
- **Customer View**: Search & filter restaurants by cuisine/rating/delivery time, menu browsing with veg/non-veg filter, cart drawer, checkout (mock card/UPI/COD), visual order status stepper, order history with reorder trigger, and 5-star review system.
- **Restaurant Admin Portal**: Live order queue management (Accepted → Preparing → Ready for Pickup), menu item CRUD (Add/Edit/Delete/Availability), and sales analytics summary.
- **Delivery Driver Portal**: Active assigned deliveries, pickup/drop location details, customer contact links, and one-tap status updates (Picked Up → Out for Delivery → Delivered).
- **Platform Admin & DBMS SQL Showcase**: System stats and **Live Interactive SQL Query Runner** demonstrating all 10 required course queries against the active database.

---

## 🔑 Demo Credentials (Quick Role Switcher)

Use the **"Demo Role" dropdown** in the top navigation bar to switch between roles instantly during presentation:

| Role | Email | Password | Primary Interface |
|---|---|---|---|
| **Customer** | `customer1@demo.local` | `demo123` | Home, Restaurant Menu, Cart, Checkout, Tracking |
| **Restaurant Admin** | `admin1@demo.local` | `demo123` | Kitchen Queue & Menu CRUD |
| **Delivery Driver** | `delivery1@demo.local` | `demo123` | Active Deliveries |
| **Platform Admin** | `superadmin@demo.local` | `demo123` | System Analytics & **Interactive DBMS SQL Showcase** |

---

## 📊 10 Demonstration SQL Queries (Section 8)

The system includes pre-configured SQL queries viewable and executable live in the Admin Dashboard:

1. **Cuisine Search & Filter**: Find restaurants by cuisine, ordered by rating & delivery time.
2. **Customer Order History**: Complete item breakdown and price history per order.
3. **Restaurant Revenue**: Gross revenue, net subtotal, and tax collected per restaurant.
4. **Top 5 Best-Selling Items**: Aggregated sales volume across the platform.
5. **Dormant Restaurants**: Identify restaurants with zero orders in 30 days (`LEFT JOIN / NULL`).
6. **Active Order & Courier Info**: Full order status, driver contact, vehicle info, and assignment timestamps.
7. **Calculated Restaurant Ratings**: Dynamic `AVG(rating)` computation compared against stored column.
8. **Dormant Customers**: Registered users who have never placed an order (`NOT EXISTS`).
9. **Busiest Hours Analysis**: Grouping orders by hour of day (`STRFTIME`).
10. **Most Popular Cuisines**: Total order volume and revenue grouped by cuisine type.

---

## 🛠️ Project Structure

```text
food-ordering-system/
│
├── database/
│   ├── schema.sql              # DDL Script (16 tables, FKs, CHECKs, Indexes)
│   ├── seed_data.sql           # DML Script (5 restaurants, 60+ menu items, 8 users)
│   ├── views.sql               # Analytical SQL Views
│   ├── triggers.sql            # SQLite Triggers for rating recalculation
│   ├── queries.sql             # 10 Annotated DBMS Course Queries
│   └── food_delivery.db        # Generated SQLite database file
│
├── backend/
│   ├── src/
│   │   ├── db/                 # DB connection & init script
│   │   ├── middleware/         # JWT auth & role check middleware
│   │   ├── routes/             # REST endpoints (auth, restaurants, cart, orders, admin, delivery, reviews, dbQueries)
│   │   └── index.js            # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                # REST API client
│   │   ├── components/         # Navbar, AuthModal, CartDrawer, OrderStepper, ReviewModal, SqlShowcase
│   │   ├── context/            # AuthContext & CartContext
│   │   ├── pages/              # HomePage, RestaurantPage, CheckoutPage, OrderTrackingPage, OrderHistoryPage, RestaurantAdminPage, DeliveryDashboardPage, AdminDashboardPage
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Router setup
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── ER_Diagram.md           # ER Diagram & Entity specifications
│   ├── Normalization_Report.md # 1NF, 2NF, 3NF Normalization justification
│   └── Project_Report.md       # Academic project report
│
└── README.md
```
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
   ```

*Note: The application also includes an instant simulated fallback for Google sign-in if no Client ID is configured.*
