const db = require('./db');
const today = new Date().toISOString().split('T')[0];

db.run('DELETE FROM attendance WHERE date = ?', [today], function(err) {
    if (err) {
        console.error(err);
    } else {
        console.log(`Deleted ${this.changes} attendance records for today (${today}). You can now start fresh!`);
    }
});
