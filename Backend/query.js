const db = require('./db');

db.all('SELECT * FROM attendance', [], (err, rows) => {
    if (err) console.error(err);
    console.log("ATTENDANCE RECORDS:", rows);
});

db.all('SELECT id, name FROM users', [], (err, rows) => {
    if (err) console.error(err);
    console.log("USERS:", rows);
});
