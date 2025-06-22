# Cloud Payroll - Full-Stack Employee Management System

A modern, full-stack payroll management application built with React frontend and Node.js/Express backend, featuring comprehensive employee, payroll, and reporting capabilities. The application is deployed and ready for production use.

## 🚀 Live Demo

- **Frontend**: [https://cloud-payroll-42t0z030l-orjidavid18-6781s-projects.vercel.app](https://cloud-payroll-42t0z030l-orjidavid18-6781s-projects.vercel.app)
- **Backend API**: [https://cloud-payroll-backend.onrender.com](https://cloud-payroll-backend.onrender.com)

## 🎯 Features

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, Manager, User)
- Protected routes and secure API endpoints
- Password hashing with bcrypt

### 📊 Dashboard
- Real-time statistics: total employees, active employees, total payroll, pending payments
- Recent payroll processing history
- Quick actions and visual analytics
- Clean, modern UI with intuitive navigation

### 👥 Employee Management
- Full CRUD operations for employee records
- Real-time search and status filtering
- Data export to CSV
- Professional modals for employee details
- Employee profiles with contact information

### 💰 Payroll Management
- Payroll processing with confirmation
- Payroll preview and history
- Detailed breakdowns for payroll periods
- Export payroll reports to CSV
- Timesheet integration

### 📈 Reports & Analytics
- Payroll, employee, and department reports
- CSV export for all reports
- Real-time data updates
- Comprehensive reporting dashboard

### ⚙️ Settings & Configuration
- User profile management
- Dark mode toggle
- User preferences and settings

### 🎨 User Interface
- Responsive design for all devices
- Modern UI with Tailwind CSS
- Tab navigation and modal dialogs
- Loading states and smooth transitions

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cloud-payroll/payroll-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `payroll-backend` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cloud-payroll?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=24h

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Admin Default Credentials
   ADMIN_EMAIL=admin@company.com
   ADMIN_PASSWORD=ChangeThisToAStrongPassword123!
   ADMIN_NAME=Admin User
   ```

4. **Initialize Database**
   ```bash
   node utils/initDb.js
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../payroll-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `payroll-frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🔑 Default Login Credentials

### Admin Access
- **Email**: `admin@company.com`
- **Password**: `ChangeThisToAStrongPassword123!`

### Manager Access
- **Email**: `manager@company.com`
- **Password**: `manager123`

## 🚀 Deployment

### Backend Deployment (Render)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure environment variables**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `JWT_EXPIRE`: `24h`
   - `NODE_ENV`: `production`
   - `ADMIN_EMAIL`: `admin@company.com`
   - `ADMIN_PASSWORD`: `ChangeThisToAStrongPassword123!`
   - `ADMIN_NAME`: `Admin User`

4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

### Frontend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel**
2. **Set the root directory to**: `payroll-frontend`
3. **Configure environment variables**:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

4. **Deploy**

## 📱 Usage Guide

1. **Login**: Use the provided credentials to access the system
2. **Dashboard**: View real-time statistics and quick actions
3. **Employees**: Manage employee records with full CRUD operations
4. **Payroll**: Process payroll and review history
5. **Reports**: Generate and export reports
6. **Settings**: Manage user profile and preferences

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Payroll
- `GET /api/payroll` - Get payroll history
- `POST /api/payroll` - Process payroll
- `GET /api/payroll/:id` - Get specific payroll

### Reports
- `GET /api/reports/payroll` - Payroll reports
- `GET /api/reports/employees` - Employee reports

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- Helmet security headers

## 🚀 Available Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node utils/initDb.js` - Initialize database with sample data

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🔮 Future Enhancements

- Advanced analytics and charts
- Email notifications
- Tax calculations
- Time tracking integration
- Benefits management
- Multi-company support
- Internationalization
- Accessibility improvements
- Mobile app development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the deployment logs for errors
- Verify environment variables are correctly set

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**