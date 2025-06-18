# Cloud Payroll Backend API

A comprehensive Node.js/Express backend API for the Cloud Payroll Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user CRUD operations with profile management
- **Employee Management**: Employee records with detailed information
- **Payroll Processing**: Automated payroll calculation and processing
- **Time Tracking**: Timesheet management with approval workflows
- **Reporting**: Comprehensive reporting and analytics
- **Security**: Rate limiting, input validation, and security headers
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
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
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/cloud-payroll
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=24h
   ```

4. **Initialize Database**
   ```bash
   npm run init-db
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Setup

The backend uses MongoDB with the following collections:

- **Users**: System users with authentication and roles
- **Employees**: Employee records and information
- **Payroll**: Payroll processing and history
- **Timesheets**: Time tracking and project management

### Default Admin User
- Email: `admin@company.com`
- Password: `admin123`
- Role: `admin`

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
- `npm run init-db` - Initialize database with sample data

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/cloud-payroll |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRE` | JWT expiration time | 24h |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

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

## 🧪 Testing

To test the API endpoints, you can use tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

### Example API Calls

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "admin123"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Deployment

### Production Considerations
1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB Atlas or production MongoDB
4. Set up proper CORS origins
5. Configure rate limiting for production
6. Use environment-specific variables

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation
- Review the error logs
- Ensure all environment variables are set correctly
- Verify MongoDB connection

## 🔄 Updates

This backend is designed to work seamlessly with the Cloud Payroll frontend. Ensure both frontend and backend are running on their respective ports (3000 and 5000) for full functionality. 