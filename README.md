# Cloud Payroll

A modern, full-stack payroll management system for businesses, featuring employee, payroll, and reporting management. Built with React (frontend) and Node.js/Express (backend), using MongoDB Atlas.

## 🚀 Live Demo
- **Frontend**: [https://cloud-payroll-42t0z030l-orjidavid18-6781s-projects.vercel.app](https://cloud-payroll-42t0z030l-orjidavid18-6781s-projects.vercel.app)
- **Backend API**: [https://cloud-payroll-backend.onrender.com](https://cloud-payroll-backend.onrender.com)

## 🎯 Features
- Secure authentication (JWT, roles)
- Employee management (CRUD, search, filter)
- Payroll processing and history
- Timesheet integration
- Analytics and reporting (CSV export)
- Responsive, modern UI (dark mode, mobile/tablet/desktop)

## 🛠 Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide Icons, React Router
- **Backend**: Node.js, Express, MongoDB Atlas, JWT, bcrypt, Helmet, CORS

## ⚡ Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account

### Backend Setup
```bash
git clone <repository-url>
cd cloud-payroll/payroll-backend
npm install
# Configure .env (see below)
node utils/initDb.js # (optional: seed sample data)
npm start
```

**.env example:**
```
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
```

### Frontend Setup
```bash
cd ../payroll-frontend
npm install
# Configure .env
npm start
```
**.env example:**
```
REACT_APP_API_URL=http://localhost:5000
```

## 🔑 Default Login
- **Admin**: admin@company.com / ChangeThisToAStrongPassword123!
- **Manager**: manager@company.com / manager123

## 🚀 Deployment
- **Backend**: Deploy to Render (set env vars as above)
- **Frontend**: Deploy to Vercel (set `REACT_APP_API_URL` to backend URL)

## 📱 Usage
- Login with provided credentials
- Use dashboard, employees, payroll, reports, and settings (dark mode)

## 🔧 API Overview
- `/api/auth/login` — User login
- `/api/employees` — Employee CRUD
- `/api/payroll` — Payroll processing/history
- `/api/reports` — Analytics & reports

## 🔒 Security
- JWT authentication, bcrypt password hashing, CORS, Helmet, rate limiting

## 📄 License
MIT License

## 🆘 Support
- Create an issue in the repository for help

---
Built with ❤️ using React, Node.js, Express, and MongoDB