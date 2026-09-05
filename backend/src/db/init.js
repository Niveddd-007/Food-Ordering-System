const fs = require('fs');
const path = require('path');
const db = require('./db');

async function initDb() {
    console.log('⚡ Initializing Database with sql.js engine...');
    await db.init();

    const dbFolder = path.join(__dirname, '../../../database');
    const schemaPath = path.join(dbFolder, 'schema.sql');
    const seedPath = path.join(dbFolder, 'seed_data.sql');
    const viewsPath = path.join(dbFolder, 'views.sql');
    const triggersPath = path.join(dbFolder, 'triggers.sql');

    try {
        if (fs.existsSync(schemaPath)) {
            console.log('Executing DDL Schema...');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schemaSql);
        }

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

        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        console.log(`✅ Database Initialized Successfully! Active tables (${tables.length}):`, tables.map(t => t.name).join(', '));
    } catch (err) {
        console.error('❌ Database Initialization Failed:', err);
    }
}

if (require.main === module) {
    initDb();
}

module.exports = initDb;
