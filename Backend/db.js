const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize tables
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Employee',
                phone TEXT,
                date_of_birth TEXT,
                address TEXT,
                nationality TEXT,
                gender TEXT,
                marital_status TEXT,
                date_of_joining TEXT,
                job_position TEXT,
                department TEXT,
                manager TEXT,
                location TEXT,
                bank_name TEXT,
                account_number TEXT,
                ifsc_code TEXT,
                pan_no TEXT,
                uan_no TEXT,
                emp_code TEXT,
                is_verified INTEGER DEFAULT 0
            )`);
            
            // Alter table for existing dbs (ignore error if column exists)
            db.run(`ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0`, (err) => {
                // Ignore err (column exists)
            });

            // Attendance table
            db.run(`CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                date TEXT NOT NULL,
                check_in TEXT,
                check_out TEXT,
                status TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            // Leave Requests table
            db.run(`CREATE TABLE IF NOT EXISTS leave_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                remarks TEXT,
                admin_comments TEXT,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);

            // Salary Structure table
            db.run(`CREATE TABLE IF NOT EXISTS salary_structure (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                wage REAL NOT NULL DEFAULT 0,
                basic_percent REAL DEFAULT 50,
                hra_percent REAL DEFAULT 50,
                standard_percent REAL DEFAULT 16.67,
                performance_percent REAL DEFAULT 8.33,
                lta_percent REAL DEFAULT 8.33,
                pf_percent REAL DEFAULT 12,
                professional_tax REAL DEFAULT 200,
                working_days REAL DEFAULT 22,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )`);
        });
    }
});

module.exports = db;
