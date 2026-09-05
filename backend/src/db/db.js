const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../../database/food_delivery.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;

// Synchronous load wrapper
function getDbInstance() {
    if (dbInstance) return dbInstance;

    // Load file if exists
    let fileBuffer = null;
    if (fs.existsSync(dbPath)) {
        try {
            fileBuffer = fs.readFileSync(dbPath);
        } catch (e) {
            console.error('Error reading db file:', e);
        }
    }

    // Initialize sql.js synchronously via initSqlJs
    // Note: initSqlJs returns a promise, so we resolve it once on boot
    throw new Error('Database not initialized yet. Call initDatabase() first.');
}

// Global state
let db = null;
let SQL = null;

async function initDbConnection() {
    if (db) return db;
    SQL = await initSqlJs();
    if (fs.existsSync(dbPath)) {
        const filebuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(filebuffer);
    } else {
        db = new SQL.Database();
    }
    // Enable Foreign Keys
    db.run("PRAGMA foreign_keys = ON;");
    return db;
}

function saveDb() {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error('Failed to persist database file:', err);
    }
}

// Unified db helper mimicking better-sqlite3 API
const dbWrapper = {
    async init() {
        await initDbConnection();
        saveDb();
    },

    exec(sql) {
        if (!db) throw new Error('Database not initialized');
        db.run(sql);
        saveDb();
    },

    prepare(sql) {
        return {
            all(...params) {
                if (!db) throw new Error('Database not initialized');
                // Handle array passed as single argument
                const args = (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
                const stmt = db.prepare(sql);
                stmt.bind(args);
                const results = [];
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            },

            get(...params) {
                if (!db) throw new Error('Database not initialized');
                const args = (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
                const stmt = db.prepare(sql);
                stmt.bind(args);
                let result = null;
                if (stmt.step()) {
                    result = stmt.getAsObject();
                }
                stmt.free();
                return result;
            },

            run(...params) {
                if (!db) throw new Error('Database not initialized');
                const args = (params.length === 1 && Array.isArray(params[0])) ? params[0] : params;
                db.run(sql, args);
                
                // Fetch last_insert_rowid and total_changes
                const lastIdRes = db.exec("SELECT last_insert_rowid() as id, changes() as cnt");
                let lastInsertRowid = 0;
                let changes = 0;
                if (lastIdRes && lastIdRes.length > 0 && lastIdRes[0].values.length > 0) {
                    lastInsertRowid = lastIdRes[0].values[0][0];
                    changes = lastIdRes[0].values[0][1];
                }
                
                saveDb();
                return { lastInsertRowid, changes };
            }
        };
    }
};

module.exports = dbWrapper;
