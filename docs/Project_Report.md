# Comprehensive Academic Project Report: Online Food Ordering System

**Course**: Database Management Systems (DBMS)  
**Project Title**: Online Food Ordering System with Real OAuth & Normalized Schema  
**Academic Year**: 2026  

---

## 1. Project Overview & Objectives
The goal of this project is to design, model, implement, and deploy a full-stack, production-grade **Online Food Ordering System**. While serving as an academic deliverable for a DBMS course, the application maintains commercial UI/UX standards, modern authentication, role-based authorization, and high data integrity.

### Primary Deliverables Met:
1. **Normalized Database (3NF)**: 16 relational tables with strict Foreign Keys, Indexes, Views, and Triggers.
2. **Real Authentication**: Local bcrypt password hashing combined with Google OAuth 2.0.
3. **Multi-Role User Portals**:
   - Customer (Search, Menu, Cart Drawer, Checkout, Live Order Stepper, Reviews)
   - Restaurant Admin (Live Kitchen Queue & Menu CRUD)
   - Delivery Driver (Active Assignments & Status Updates)
   - Platform Admin (**Interactive DBMS SQL Showcase**)
4. **10 Demonstration SQL Queries**: Interactive execution environment embedded in the admin panel.

---

## 2. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│               Client Layer (React 18 + Vite)                │
│     Tailwind CSS + Lucide React + Google OAuth GIS SDK      │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API / JWT Token
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend Controller Layer (Express.js)            │
│  Auth Middleware • Order Processor • Admin Queue • API      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Raw SQL Engine
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Database Layer (SQLite Relational Engine)          │
│   16 Tables • 4 Views • 3 Triggers • Indexes • FK Constraints│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Highlights

### Views
- `v_restaurant_sales_summary`: Computes revenue, total orders, completed vs cancelled counts per restaurant.
- `v_top_rated_menu_items`: Joins menu items with sales volumes and ratings.
- `v_busiest_hours`: Hourly order volume analysis.
- `v_popular_cuisines`: Aggregate order counts grouped by cuisine.

### Triggers
- `trg_review_insert_rating`: Recalculates `restaurants.avg_rating` automatically upon review insertion.
- `trg_review_update_rating`: Recalculates average rating upon review update.
- `trg_order_update_timestamp`: Updates `orders.updated_at` automatically on status change.

---

## 4. Verification & Testing

All test workflows passed successfully:
- Database schema initialization test: 16 active tables created.
- Seed data insertion test: 5 restaurants, 60+ menu items, 8 users, 5 past orders, and reviews populated.
- Frontend build check (`npm run build`): Completed in 1.97s with 0 errors.
- End-to-end demo flow: Customer order placement → Restaurant Admin kitchen queue acceptance → Delivery Driver pickup & drop-off → Customer rating submission.
