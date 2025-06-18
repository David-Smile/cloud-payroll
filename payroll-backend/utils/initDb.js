const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB for initialization');

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      // Create default admin user
      const adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        department: 'IT',
        bio: 'System administrator with full access to all features.'
      });

      console.log('✅ Default admin user created:', adminUser.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample employees if none exist
    const employeeCount = await Employee.countDocuments();
    
    if (employeeCount === 0) {
      const sampleEmployees = [
        {
          name: 'John Smith',
          email: 'john.smith@company.com',
          position: 'Software Engineer',
          department: 'Engineering',
          salary: 85000,
          status: 'active',
          phone: '+1 (555) 123-4567',
          address: {
            street: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          createdBy: adminExists ? adminExists._id : (await User.findOne({ role: 'admin' }))._id
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          position: 'Product Manager',
          department: 'Product',
          salary: 95000,
          status: 'active',
          phone: '+1 (555) 234-5678',
          address: {
            street: '456 Oak Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'USA'
          },
          createdBy: adminExists ? adminExists._id : (await User.findOne({ role: 'admin' }))._id
        },
        {
          name: 'Mike Davis',
          email: 'mike.davis@company.com',
          position: 'UX Designer',
          department: 'Design',
          salary: 75000,
          status: 'active',
          phone: '+1 (555) 345-6789',
          address: {
            street: '789 Pine St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94108',
            country: 'USA'
          },
          createdBy: adminExists ? adminExists._id : (await User.findOne({ role: 'admin' }))._id
        },
        {
          name: 'Emily Wilson',
          email: 'emily.wilson@company.com',
          position: 'Marketing Specialist',
          department: 'Marketing',
          salary: 65000,
          status: 'inactive',
          phone: '+1 (555) 456-7890',
          address: {
            street: '321 Market St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94103',
            country: 'USA'
          },
          createdBy: adminExists ? adminExists._id : (await User.findOne({ role: 'admin' }))._id
        },
        {
          name: 'David Brown',
          email: 'david.brown@company.com',
          position: 'Data Analyst',
          department: 'Analytics',
          salary: 70000,
          status: 'active',
          phone: '+1 (555) 567-8901',
          address: {
            street: '654 Mission St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'USA'
          },
          createdBy: adminExists ? adminExists._id : (await User.findOne({ role: 'admin' }))._id
        },
        {
          name: 'Lisa Garcia',
          email: 'lisa.garcia@company.com',
          position: 'HR Manager',
          department: 'Human Resources',
          salary: 80000,
          status: 'active',
          phone: '+1 (555) 678-9012',
          address: {
            street: '987 Sutter St',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94109',
            country: 'USA'
          },
          createdBy: adminExists ? adminExists._id : (await User.findOne({ role: 'admin' }))._id
        }
      ];

      await Employee.insertMany(sampleEmployees);
      console.log('✅ Sample employees created');
    } else {
      console.log('ℹ️  Employees already exist');
    }

    console.log('🎉 Database initialization completed successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase; 