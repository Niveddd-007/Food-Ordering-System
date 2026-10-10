const fs = require('fs');
const path = require('path');
const db = require('./db');

const dbFolder = path.join(__dirname, '../../../database');
const schemaPath = path.join(dbFolder, 'schema.sql');
const seedPath = path.join(dbFolder, 'seed_data.sql');
const viewsPath = path.join(dbFolder, 'views.sql');
const triggersPath = path.join(dbFolder, 'triggers.sql');

function applyColumnMigrations() {
    const migrations = [
        "ALTER TABLE cart_items ADD COLUMN selected_variant TEXT NULL;",
        "ALTER TABLE cart_items ADD COLUMN selected_addons TEXT NULL;",
        "ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;",
        "ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL;",
        "ALTER TABLE order_items ADD COLUMN selected_variant TEXT NULL;",
        "ALTER TABLE order_items ADD COLUMN selected_addons TEXT NULL;"
    ];

    for (const sql of migrations) {
        try {
            db.exec(sql);
        } catch (e) {
            // Column already exists or table not ready, safely ignore
        }
    }
}

async function initDb() {
    console.log('⚡ Initializing Database with sql.js engine...');
    await db.init();

    try {
        if (fs.existsSync(schemaPath)) {
            console.log('Executing DDL Schema...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schemaSql);
        }

        // Apply column migrations if old schema exists
        applyColumnMigrations();

        if (fs.existsSync(viewsPath)) {
            console.log('Executing Views...');
            const viewsSql = fs.readFileSync(viewsPath, 'utf8');
            db.exec(viewsSql);
        }

        if (fs.existsSync(triggersPath)) {
            console.log('Executing Triggers...');
            const triggersSql = fs.readFileSync(triggersPath, 'utf8');
            db.exec(triggersSql);
        }

        // Check user count
        const userCheck = db.prepare('SELECT COUNT(*) as count FROM users').get();
        const userCount = userCheck ? userCheck.count : 0;
        
        if (userCount === 0 && fs.existsSync(seedPath)) {
            console.log('Executing Seed Data (DML)...');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            db.exec(seedSql);
        }

        // Check if coupons exist, if not seed them
        const couponCheck = db.prepare('SELECT COUNT(*) as count FROM coupons').get();
        if ((!couponCheck || couponCheck.count === 0) && fs.existsSync(seedPath)) {
            console.log('Seeding coupons, variants & addons...');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            db.exec(seedSql);
        }

        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        console.log(`✅ Database Initialized Successfully! Active tables (${tables.length}):`, tables.map(t => t.name).join(', '));
    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
}

async function resetDatabase() {
    console.log('🔄 Performing full database factory reset...');
    await db.init();

    // Disable foreign keys temporarily for clean cascade drop
    db.exec("PRAGMA foreign_keys = OFF;");

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    for (const t of tables) {
        db.exec(`DROP TABLE IF EXISTS "${t.name}";`);
    }

    const views = db.prepare("SELECT name FROM sqlite_master WHERE type='view'").all();
    for (const v of views) {
        db.exec(`DROP VIEW IF EXISTS "${v.name}";`);
    }

    const triggers = db.prepare("SELECT name FROM sqlite_master WHERE type='trigger'").all();
    for (const trg of triggers) {
        db.exec(`DROP TRIGGER IF EXISTS "${trg.name}";`);
    }

    db.exec("PRAGMA foreign_keys = ON;");

    // Re-run DDL schema, views, triggers, and seed data
    if (fs.existsSync(schemaPath)) {
        db.exec(fs.readFileSync(schemaPath, 'utf8'));
    }
    if (fs.existsSync(viewsPath)) {
        db.exec(fs.readFileSync(viewsPath, 'utf8'));
    }
    if (fs.existsSync(triggersPath)) {
        db.exec(fs.readFileSync(triggersPath, 'utf8'));
    }
    if (fs.existsSync(seedPath)) {
        db.exec(fs.readFileSync(seedPath, 'utf8'));
    }

    const freshTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    console.log(`✅ Database Reset Complete! Re-created ${freshTables.length} tables.`);
    return { tables: freshTables.map(t => t.name), count: freshTables.length };
}

if (require.main === module) {
    initDb();
}

module.exports = {
    initDb,
    resetDatabase
};
