const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const sampleUsers = [
  { name: 'John Doe', email: 'john@hrms.com', role: 'Employee', job_position: 'Frontend Developer' },
  { name: 'Jane Smith', email: 'jane@hrms.com', role: 'Employee', job_position: 'Backend Developer' },
  { name: 'Michael Scott', email: 'michael@hrms.com', role: 'Employee', job_position: 'Regional Manager' },
  { name: 'Pam Beesly', email: 'pam@hrms.com', role: 'Employee', job_position: 'Receptionist' },
  { name: 'Jim Halpert', email: 'jim@hrms.com', role: 'Employee', job_position: 'Sales Rep' },
];

const seedDatabase = async () => {
  console.log('Starting to seed the database with random employees...');
  const yearOfJoining = new Date().getFullYear().toString();
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  db.serialize(() => {
    let serial = 1000;
    for (const u of sampleUsers) {
      serial++;
      const empId = `OI${u.name.substring(0, 2).toUpperCase()}XX${yearOfJoining}${serial}`;
      
      const insertQuery = `
          INSERT INTO users (id, name, email, password, role, date_of_joining, job_position, is_verified)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `;
      
      db.run(insertQuery, [empId, u.name, u.email, defaultPasswordHash, u.role, `${yearOfJoining}-01-01`, u.job_position], function(err) {
        if (err) {
          if (!err.message.includes('UNIQUE constraint failed')) {
            console.error('Error inserting user:', err.message);
          } else {
             console.log(`User ${u.email} already exists, skipping.`);
          }
        } else {
          console.log(`Inserted ${u.name} with ID ${empId}`);
          db.run(`INSERT INTO salary_structure (user_id) VALUES (?)`, [empId]);
        }
      });
    }
  });

  setTimeout(() => {
    console.log('Seeding completed!');
    process.exit(0);
  }, 2000);
};

seedDatabase();
