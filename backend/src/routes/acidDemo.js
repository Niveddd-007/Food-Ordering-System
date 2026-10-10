const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Interactive ACID Transaction & Concurrency Simulator
router.post('/db/acid-simulate', (req, res) => {
    const { simulate_failure = false, failure_step = 'payment' } = req.body;
    const logs = [];

    // Snapshot counts before transaction
    const beforeOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const beforeOrderItems = db.prepare('SELECT COUNT(*) as count FROM order_items').get().count;
    const beforePayments = db.prepare('SELECT COUNT(*) as count FROM payments').get().count;

    logs.push({
        step: 0,
        name: 'PRE-TRANSACTION AUDIT',
        sql: 'SELECT COUNT(*) FROM orders, order_items, payments;',
        status: 'INFO',
        details: `Initial database state: ${beforeOrders} orders, ${beforeOrderItems} order items, ${beforePayments} payments.`,
        timestamp: new Date().toISOString()
    });

    let transactionStarted = false;

    try {
        // Step 1: BEGIN TRANSACTION
        db.exec('BEGIN TRANSACTION;');
        transactionStarted = true;
        logs.push({
            step: 1,
            name: 'BEGIN TRANSACTION',
            sql: 'BEGIN TRANSACTION;',
            status: 'SUCCESS',
            details: 'Exclusive write lock acquired. Atomicity and Isolation guarantees initialized.',
            timestamp: new Date().toISOString()
        });

        // Step 2: Validate Cart & Customer
        const customer = db.prepare('SELECT * FROM users WHERE role = "customer" LIMIT 1').get();
        const restaurant = db.prepare('SELECT * FROM restaurants LIMIT 1').get();
        const item = db.prepare('SELECT * FROM menu_items WHERE is_available = 1 LIMIT 1').get();

        if (simulate_failure && failure_step === 'inventory') {
            throw new Error('[SIMULATED ERROR - INVENTORY]: Item is out of stock. Stock reservation lock failed.');
        }

        logs.push({
            step: 2,
            name: 'INVENTORY & CUSTOMER CHECK',
            sql: `SELECT * FROM menu_items WHERE item_id = ${item.item_id} AND is_available = 1;`,
            status: 'SUCCESS',
            details: `Validated customer "${customer.name}" and locked menu item "${item.name}" (Price: $${item.price}).`,
            timestamp: new Date().toISOString()
        });

        // Step 3: Insert Order
        const orderInsert = db.prepare(`
            INSERT INTO orders (customer_id, restaurant_id, delivery_address, order_status, subtotal_amount, tax_amount, delivery_fee, total_amount, notes)
            VALUES (?, ?, 'ACID Demo St., Lab Room 402', 'Placed', ?, ?, 3.99, ?, 'ACID Transaction Test')
        `).run(customer.user_id, restaurant.restaurant_id, item.price, (item.price * 0.05).toFixed(2), (item.price * 1.05 + 3.99).toFixed(2));

        const orderId = orderInsert.lastInsertRowid;

        logs.push({
            step: 3,
            name: 'INSERT ORDER HEADER',
            sql: `INSERT INTO orders (customer_id, restaurant_id, total_amount) VALUES (${customer.user_id}, ${restaurant.restaurant_id}, ${(item.price * 1.05 + 3.99).toFixed(2)});`,
            status: 'SUCCESS',
            details: `Uncommitted row created in 'orders' table with order_id = ${orderId}.`,
            timestamp: new Date().toISOString()
        });

        // Step 4: Insert Order Items
        db.prepare(`
            INSERT INTO order_items (order_id, item_id, quantity, price_at_order_time)
            VALUES (?, ?, 1, ?)
        `).run(orderId, item.item_id, item.price);

        logs.push({
            step: 4,
            name: 'INSERT ORDER ITEMS',
            sql: `INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (${orderId}, ${item.item_id}, 1, ${item.price});`,
            status: 'SUCCESS',
            details: `Uncommitted row created in 'order_items' table linking item_id ${item.item_id} to order_id ${orderId}.`,
            timestamp: new Date().toISOString()
        });

        // Step 5: Process Payment
        if (simulate_failure && (failure_step === 'payment' || failure_step === 'network')) {
            throw new Error('[SIMULATED ERROR - PAYMENT GATEWAY]: Network timeout / Card declined by issuing bank (HTTP 504).');
        }

        const txnRef = `TXN-ACID-${Math.floor(10000000 + Math.random() * 90000000)}`;
        db.prepare(`
            INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_ref)
            VALUES (?, 'card', 'completed', ?, ?)
        `).run(orderId, (item.price * 1.05 + 3.99).toFixed(2), txnRef);

        logs.push({
            step: 5,
            name: 'RECORD PAYMENT',
            sql: `INSERT INTO payments (order_id, amount, status) VALUES (${orderId}, ${(item.price * 1.05 + 3.99).toFixed(2)}, 'completed');`,
            status: 'SUCCESS',
            details: `Payment authorized and transaction logged with ref ${txnRef}.`,
            timestamp: new Date().toISOString()
        });

        // Step 6: COMMIT TRANSACTION
        db.exec('COMMIT;');
        transactionStarted = false;

        const afterOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const afterOrderItems = db.prepare('SELECT COUNT(*) as count FROM order_items').get().count;
        const afterPayments = db.prepare('SELECT COUNT(*) as count FROM payments').get().count;

        logs.push({
            step: 6,
            name: 'COMMIT TRANSACTION',
            sql: 'COMMIT;',
            status: 'COMMITTED',
            details: 'All changes permanently persisted (Durability guaranteed). Locks released.',
            timestamp: new Date().toISOString()
        });

        return res.json({
            outcome: 'COMMITTED',
            success: true,
            simulated_failure: false,
            message: 'Transaction successfully executed and committed according to ACID guarantees!',
            audit: {
                before: { orders: beforeOrders, order_items: beforeOrderItems, payments: beforePayments },
                after: { orders: afterOrders, order_items: afterOrderItems, payments: afterPayments },
                net_change: { orders: afterOrders - beforeOrders, order_items: afterOrderItems - beforeOrderItems, payments: afterPayments - beforePayments }
            },
            logs
        });

    } catch (err) {
        if (transactionStarted) {
            try {
                db.exec('ROLLBACK;');
            } catch (rbErr) {
                console.error('Error during rollback:', rbErr);
            }
        }

        const afterOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
        const afterOrderItems = db.prepare('SELECT COUNT(*) as count FROM order_items').get().count;
        const afterPayments = db.prepare('SELECT COUNT(*) as count FROM payments').get().count;

        logs.push({
            step: 99,
            name: 'ROLLBACK TRANSACTION',
            sql: 'ROLLBACK;',
            status: 'ROLLED_BACK',
            details: `Failure encountered: ${err.message}. ROLLBACK executed! All uncommitted rows purged. Zero orphan rows remain.`,
            timestamp: new Date().toISOString()
        });

        return res.json({
            outcome: 'ROLLED_BACK',
            success: false,
            simulated_failure: true,
            error: err.message,
            message: 'Transaction was safely aborted and rolled back. All tables restored to original state!',
            audit: {
                before: { orders: beforeOrders, order_items: beforeOrderItems, payments: beforePayments },
                after: { orders: afterOrders, order_items: afterOrderItems, payments: afterPayments },
                net_change: { orders: afterOrders - beforeOrders, order_items: afterOrderItems - beforeOrderItems, payments: afterPayments - beforePayments },
                orphan_records_prevented: true
            },
            logs
        });
    }
});

// Explain Query Plan endpoint for DBMS benchmark
router.post('/db/explain-query', (req, res) => {
    try {
        const { sql } = req.body;
        if (!sql) return res.status(400).json({ error: 'SQL query required' });

        const plan = db.prepare(`EXPLAIN QUERY PLAN ${sql}`).all();
        res.json({ sql, plan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
