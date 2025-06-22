# Cloud Payroll Backend API

A comprehensive Node.js/Express backend API for the Cloud Payroll Management System. This backend is deployed and ready for production use.

## 🚀 Live API

- **API Base URL**: [https://cloud-payroll-backend.onrender.com](https://cloud-payroll-backend.onrender.com)
- **Health Check**: [https://cloud-payroll-backend.onrender.com/api/health](https://cloud-payroll-backend.onrender.com/api/health)

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user CRUD operations with profile management
- **Employee Management**: Employee records with detailed information
- **Payroll Processing**: Automated payroll calculation and processing
- **Time Tracking**: Timesheet management with approval workflows
- **Reporting**: Comprehensive reporting and analytics
- **Security**: Rate limiting, input validation, and security headers
- **Database**: MongoDB Atlas with Mongoose ODM

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd payroll-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with your configuration:
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

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Setup

The backend uses MongoDB Atlas with the following collections:

- **Users**: System users with authentication and roles
- **Employees**: Employee records and information
- **Payroll**: Payroll processing and history
- **Timesheets**: Time tracking and project management

### Default Users
- **Admin**: `admin@company.com` / `ChangeThisToAStrongPassword123!`
- **Manager**: `manager@company.com` / `manager123`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **admin**: Full access to all features
- **manager**: Access to employee management, payroll, and reports
- **user**: Basic access to view own data

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - User logout

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee (Admin/Manager)
- `PUT /api/employees/:id` - Update employee (Admin/Manager)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Payroll (Admin/Manager)
- `GET /api/payroll` - Get all payrolls
- `GET /api/payroll/:id` - Get single payroll
- `POST /api/payroll` - Create payroll (Admin only)
- `PUT /api/payroll/:id` - Update payroll (Admin only)
- `POST /api/payroll/:id/process` - Process payroll (Admin only)
- `DELETE /api/payroll/:id` - Delete payroll (Admin only)

### Timesheets
- `GET /api/timesheets` - Get all timesheets
- `GET /api/timesheets/:id` - Get single timesheet
- `POST /api/timesheets` - Create timesheet
- `PUT /api/timesheets/:id` - Update timesheet
- `POST /api/timesheets/:id/approve` - Approve timesheet (Admin/Manager)
- `POST /api/timesheets/:id/reject` - Reject timesheet (Admin/Manager)
- `DELETE /api/timesheets/:id` - Delete timesheet (Admin only)

### Reports (Admin/Manager)
- `GET /api/reports/payroll-summary` - Payroll summary report
- `GET /api/reports/employee-performance` - Employee performance report
- `GET /api/reports/timesheet` - Timesheet report
- `GET /api/reports/department-summary` - Department summary
- `GET /api/reports/export/:type` - Export report (Admin only)

### Health Check
- `GET /api/health` - API health status

## 🚀 Deployment

### Render Deployment

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

## 🔧 Development

### Project Structure
```
payroll-backend/
├── config/          # Database configuration
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── .env             # Environment variables
├── package.json     # Dependencies and scripts
├── server.js        # Main server file
└── README.md        # This file
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node utils/initDb.js` - Initialize database with sample data

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB Atlas connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 24h |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `ADMIN_EMAIL` | Default admin email | admin@company.com |
| `ADMIN_PASSWORD` | Default admin password | ChangeThisToAStrongPassword123! |
| `ADMIN_NAME` | Default admin name | Admin User |

## 🛡️ Security Features

- **Helmet**: Security headers
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation with express-validator
- **Password Hashing**: bcryptjs for password security
- **JWT**: Secure token-based authentication
- **CORS**: Cross-origin resource sharing configuration

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Validation errors if any
}
```

## 🔒 CORS Configuration

The API supports multiple origins for CORS:
- `http://localhost:3000` (development)
- `https://cloud-payroll.vercel.app` (production)
- `https://cloud-payroll-42t0z030l-orjidavid18-6781s-projects.vercel.app` (preview)

## 🆘 Troubleshooting

### Common Issues

1. **JWT ExpiresIn Error**: Ensure `JWT_EXPIRE` is set to a valid value like `24h`
2. **Database Connection**: Verify your MongoDB Atlas connection string
3. **CORS Errors**: Check that your frontend URL is in the allowed origins
4. **Authentication**: Use the correct default credentials for testing

### Health Check

Test the API health at: `GET /api/health`

Expected response:
```json
{
  "success": true,
  "message": "Cloud Payroll API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
``` 