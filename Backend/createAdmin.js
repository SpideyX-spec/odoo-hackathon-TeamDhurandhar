const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('database.sqlite');

bcrypt.hash('admin123', 10, (err, hash) => {
    db.run("INSERT INTO users (id, name, email, password, role) VALUES ('OIADAD20260001', 'System Admin', 'admin@odoo.com', ?, 'Admin')", [hash], (err) => {
        if (err) {
            console.log('Already exists or error:', err.message);
        } else {
            console.log('Admin user created successfully!');
        }
    });
});
