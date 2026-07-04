# Odoo X - HRMS

![Odoo X Dashboard Concept](https://img.shields.io/badge/Odoo%20X-HRMS-875A7B?style=for-the-badge)

Odoo X is a modern, lightweight, and highly dynamic Human Resource Management System inspired by the industry-leading design of the official Odoo platform. It decouples traditional monolithic HR architectures into a blazing-fast React frontend and a robust Node.js backend. 

## ✨ Key Features

- **Role-Based Access Control:** Distinct experiences for Admin/HR and standard Employees.
- **Real-Time Attendance Tracking:** One-click Check In / Check Out from the navigation bar, updating the database in real-time.
- **Dynamic Leave Management:** Employees can request time off seamlessly. Admins can approve/reject leaves from a dedicated dashboard, which instantly updates the employee's personal calendar grid and tracks their remaining Paid Time Off balance.
- **Automated Payroll & Payslips:** Dynamically calculates an employee's salary deductions, allowances, and gross earnings strictly based on their physical attendance vs. the actual working days in the month. Includes a print-ready Payslip modal.
- **AI Chatbot Integration:** An intelligent assistant embedded directly into the app shell to answer common HR questions and guide users.
- **Modern UI/UX:** Built with a premium aesthetic featuring dark/light modes, glassmorphic panels, and smooth micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **React.js 19**
- **Vite** (Build Tool)
- **Vanilla CSS** (Custom Design System avoiding Tailwind overhead)
- **Lucide React** (Iconography)

### Backend
- **Node.js & Express** (REST API)
- **SQLite3** (Lightweight, serverless database)
- **JSON Web Tokens (JWT)** (Authentication)
- **Bcrypt.js** (Password Hashing)

---

## 🚀 Installation & Setup (Step-by-Step)

To get this project running on your local machine, you need to start both the Backend (Node.js) and the Frontend (React). Follow these exact steps:

### Prerequisites
- Make sure you have **Node.js** installed (v18 or higher).
- Make sure you have **npm** (Node Package Manager).

### 1. Setup the Backend Server
Open your terminal and navigate to the root folder, then go to the `Backend` directory:
```bash
cd Backend
```
Install all backend dependencies:
```bash
npm install
```
Start the backend server:
```bash
npm start
```
*Wait until you see "Server running on port 5000" in your terminal.*

### 2. Setup the Frontend Application
Open a **new** terminal window (keep the backend terminal running).
Navigate to the `Frontend` directory from the root:
```bash
cd Frontend
```
Install all frontend dependencies:
```bash
npm install
```
Start the development server:
```bash
npm run dev
```
*Your frontend will now run on `http://localhost:5173`. Open this link in your browser!*

### 3. Log In to Odoo X
By default, the backend has seed data for HRMS testing. Use these credentials to log in:
- **Email:** `hr@odoo.x`
- **Password:** `hrpass`

*(If the user does not exist, you can create one by running `node createAdmin.js` inside the Backend folder).*

---

## 📂 Project Structure

```text
Odoo X/
│
├── Backend/               # Node.js Express server
│   ├── index.js           # API Routes & Server logic
│   ├── db.js              # SQLite database configuration & schemas
│   ├── createAdmin.js     # Helper script to create default HR/Admin
│   └── database.sqlite    # SQLite Data store
│
└── Frontend/              # React Vite Application
    ├── src/
    │   ├── components/    # Reusable UI components (AppShell, Chatbot, etc.)
    │   ├── pages/         # Core views (Dashboard, AdminDashboard, TimeOff, Profile)
    │   ├── App.jsx        # Routing logic
    │   └── index.css      # Core Design System & styling
    └── public/            # Static assets
```

---

## 👥 Contributors

- **Team Dhurandhar** - SpideyX Spec Odoo Hackathon

---

*Built with ❤️ for the Odoo Hackathon.*
