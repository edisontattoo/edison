const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'edison.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Release Forms Table
        db.run(`CREATE TABLE IF NOT EXISTS release_forms (
            id TEXT PRIMARY KEY,
            fullName TEXT,
            email TEXT,
            phone TEXT,
            dateSigned TEXT,
            submissionType TEXT,
            formData TEXT, -- Store the full JSON object for flexibility
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Marketing List Table
        db.run(`CREATE TABLE IF NOT EXISTS marketing_list (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            source TEXT,
            subscribedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('Database tables initialized.');
    });
}

module.exports = db;
