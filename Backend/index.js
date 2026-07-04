const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a test account for nodemailer if no real SMTP provided
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecrethrmskey123';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'HR') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
};
// Helper to generate Employee ID
const generateEmployeeId = (name, yearOfJoining) => {
    return new Promise((resolve, reject) => {
        const parts = name.trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
        
        let fPrefix = firstName.substring(0, 2).toUpperCase();
        if (fPrefix.length < 2) fPrefix = fPrefix.padEnd(2, 'X');
        
        let lPrefix = lastName.substring(0, 2).toUpperCase();
        if (lPrefix.length < 2) lPrefix = lPrefix.padEnd(2, 'X');

        const prefix = `OI${fPrefix}${lPrefix}${yearOfJoining}`;

        db.get(`SELECT id FROM users WHERE id LIKE ? ORDER BY id DESC LIMIT 1`, [`${prefix}%`], (err, row) => {
            if (err) return reject(err);
            let serial = 1;
            if (row && row.id) {
                const currentSerialStr = row.id.replace(prefix, '');
                const currentSerial = parseInt(currentSerialStr, 10);
                if (!isNaN(currentSerial)) {
                    serial = currentSerial + 1;
                }
            }
            const serialStr = serial.toString().padStart(4, '0');
            resolve(`${prefix}${serialStr}`);
        });
    });
};

// --- AUTHENTICATION ENDPOINTS ---

// Admin creates new employee
app.post('/api/users/register', authMiddleware, adminMiddleware, async (req, res) => {
    const { companyName, name, email, phone, job_position } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        // Auto generate password
        const generatedPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);
        
        const yearOfJoining = new Date().getFullYear().toString();
        const empId = await generateEmployeeId(name, yearOfJoining);
        const userRole = 'Employee'; // Default to Employee for now

        const insertQuery = `
            INSERT INTO users (id, name, email, password, role, phone, date_of_joining, job_position)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(insertQuery, [empId, name, email, hashedPassword, userRole, phone, `${yearOfJoining}-01-01`, job_position], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error', details: err.message });
            }

            db.run(`INSERT INTO salary_structure (user_id) VALUES (?)`, [empId]);

            // Create verification token
            const verificationToken = jwt.sign({ id: empId }, JWT_SECRET, { expiresIn: '1d' });
            const verificationLink = `http://localhost:5173/verify/${verificationToken}`;

            // Send Email
            if (transporter) {
                transporter.sendMail({
                    from: '"HRMS System" <noreply@hrms.com>',
                    to: email,
                    subject: "Verify your HRMS Account",
                    text: `Hello ${name},\n\nYour HRMS account has been created.\n\nEmployee ID: ${empId}\nTemporary Password: ${generatedPassword}\n\nPlease click the link below to verify your email and activate your account:\n${verificationLink}\n\nThanks,\nHR Team`,
                    html: `<p>Hello ${name},</p><p>Your HRMS account has been created.</p><ul><li><strong>Employee ID:</strong> ${empId}</li><li><strong>Temporary Password:</strong> ${generatedPassword}</li></ul><p>Please click the link below to verify your email and activate your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>Thanks,<br>HR Team</p>`
                }).then(info => {
                    console.log('Verification email sent: %s', nodemailer.getTestMessageUrl(info));
                }).catch(console.error);
            }

            res.status(201).json({ message: 'User created successfully. Verification email sent.', userId: empId, autoPassword: generatedPassword });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

app.get('/api/auth/verify/:token', (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, JWT_SECRET);
        db.run(`UPDATE users SET is_verified = 1 WHERE id = ?`, [decoded.id], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
            res.json({ message: 'Email verified successfully. You can now log in.' });
        });
    } catch (err) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { loginId, password } = req.body;
    
    if (!loginId || !password) {
        return res.status(400).json({ error: 'Login ID/Email and password are required' });
    }

    const query = `SELECT * FROM users WHERE id = ? OR email = ?`;
    
    db.get(query, [loginId, loginId], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        if (user.role === 'Employee' && user.is_verified !== 1) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        
        delete user.password;
        
        res.json({ message: 'Login successful', token, user });
    });
});



// --- USER ENDPOINTS ---

app.get('/api/users/me', authMiddleware, (req, res) => {
    db.get(`SELECT id, name, email, role, phone, date_of_birth, address, nationality, gender, marital_status, date_of_joining, job_position, department, manager, location, bank_name, account_number, ifsc_code, pan_no, uan_no, emp_code FROM users WHERE id = ?`, [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

app.get('/api/users/:id', authMiddleware, (req, res) => {
    // Only Admin/HR can fetch other users, or user fetching themselves
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    db.get(`SELECT id, name, email, role, phone, date_of_birth, address, nationality, gender, marital_status, date_of_joining, job_position, department, manager, location, bank_name, account_number, ifsc_code, pan_no, uan_no, emp_code FROM users WHERE id = ?`, [req.params.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

app.put('/api/users/:id', authMiddleware, (req, res) => {
    // Users can only edit some fields, Admins can edit all.
    // For simplicity, we just allow the update if they have access.
    if (req.user.role !== 'Admin' && req.user.role !== 'HR' && req.user.id !== req.params.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    
    const fields = ['phone', 'date_of_birth', 'address', 'nationality', 'gender', 'marital_status', 'date_of_joining', 'job_position', 'department', 'manager', 'location', 'bank_name', 'account_number', 'ifsc_code', 'pan_no', 'uan_no', 'emp_code'];
    const updates = [];
    const values = [];
    
    fields.forEach(field => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(req.body[field]);
        }
    });
    
    if (updates.length === 0) return res.json({ message: 'No changes' });
    
    values.push(req.params.id);
    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'User updated successfully' });
    });
});

app.get('/api/users', authMiddleware, adminMiddleware, (req, res) => {
    db.all(`SELECT id, name, email, role, job_position FROM users`, [], (err, users) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(users);
    });
});

// --- SALARY ENDPOINTS ---

app.get('/api/salary/:userId', authMiddleware, adminMiddleware, (req, res) => {
    db.get(`SELECT * FROM salary_structure WHERE user_id = ?`, [req.params.userId], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) {
            // Create default if missing
            db.run(`INSERT INTO salary_structure (user_id) VALUES (?)`, [req.params.userId], function(err2) {
                if(err2) return res.status(500).json({ error: 'Database error' });
                db.get(`SELECT * FROM salary_structure WHERE user_id = ?`, [req.params.userId], (err3, newRow) => {
                    res.json(newRow || {});
                });
            });
            return;
        }
        res.json(row);
    });
});

app.put('/api/salary/:userId', authMiddleware, adminMiddleware, (req, res) => {
    const { wage, basic_percent, hra_percent, standard_percent, performance_percent, lta_percent, pf_percent, professional_tax, working_days } = req.body;
    db.run(`UPDATE salary_structure SET wage = ?, basic_percent = ?, hra_percent = ?, standard_percent = ?, performance_percent = ?, lta_percent = ?, pf_percent = ?, professional_tax = ?, working_days = ? WHERE user_id = ?`,
    [wage, basic_percent, hra_percent, standard_percent, performance_percent, lta_percent, pf_percent, professional_tax, working_days, req.params.userId], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Salary structure updated' });
    });
});

// --- ATTENDANCE ENDPOINTS ---

app.post('/api/attendance/check-in', authMiddleware, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    db.get(`SELECT * FROM attendance WHERE user_id = ? AND date = ?`, [req.user.id, today], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (row) return res.status(400).json({ error: 'Already checked in today' });

        db.run(`INSERT INTO attendance (user_id, date, check_in, status) VALUES (?, ?, ?, ?)`, 
        [req.user.id, today, time, 'Present'], function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Checked in successfully', time });
        });
    });
});

app.post('/api/attendance/check-out', authMiddleware, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    db.run(`UPDATE attendance SET check_out = ? WHERE user_id = ? AND date = ? AND check_out IS NULL`, 
    [time, req.user.id, today], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (this.changes === 0) return res.status(400).json({ error: 'Not checked in or already checked out' });
        res.json({ message: 'Checked out successfully', time });
    });
});

app.get('/api/attendance/today', authMiddleware, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    db.all(`SELECT a.*, u.name FROM attendance a JOIN users u ON a.user_id = u.id WHERE a.date = ?`, [today], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/attendance/my', authMiddleware, (req, res) => {
    db.all(`SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/attendance', authMiddleware, adminMiddleware, (req, res) => {
    db.all(`SELECT a.*, u.name FROM attendance a JOIN users u ON a.user_id = u.id ORDER BY a.date DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// --- LEAVE ENDPOINTS ---

app.post('/api/leave', authMiddleware, (req, res) => {
    const { start_date, end_date, type, remarks } = req.body;
    db.run(`INSERT INTO leave_requests (user_id, start_date, end_date, type, remarks) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, start_date, end_date, type, remarks], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Leave request submitted' });
    });
});

app.get('/api/leave', authMiddleware, (req, res) => {
    if (req.user.role === 'Admin' || req.user.role === 'HR') {
        db.all(`SELECT l.*, u.name FROM leave_requests l JOIN users u ON l.user_id = u.id`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    } else {
        db.all(`SELECT * FROM leave_requests WHERE user_id = ?`, [req.user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json(rows);
        });
    }
});

app.put('/api/leave/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    const { status, admin_comments } = req.body;
    db.run(`UPDATE leave_requests SET status = ?, admin_comments = ? WHERE id = ?`, 
    [status, admin_comments, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Leave status updated' });
    });
});// Serve static files from Frontend
app.use(express.static(path.join(__dirname, '../Frontend/dist')));
app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../Frontend/dist/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
