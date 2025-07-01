// Seed script for Cloud Payroll analytics demo
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Employee = require('../models/Employee');
const Timesheet = require('../models/Timesheet');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const connectDB = require('../config/database');

const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Sales', 'Marketing', 'Support'];
const POSITIONS = ['Software Engineer', 'Accountant', 'HR Manager', 'Sales Rep', 'Marketing Specialist', 'Support Agent'];
const PROJECTS = ['Apollo', 'Orion', 'Hermes', 'Athena', 'Zeus', 'Hera'];

async function seed() {
  await connectDB();
  console.log('Connected to MongoDB');

  // Clean up old data
  await Timesheet.deleteMany({});
  await Payroll.deleteMany({});
  await Employee.deleteMany({});

  // Create employees
  const employees = [];
  for (let i = 0; i < 15; i++) {
    const name = faker.person.fullName();
    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const position = faker.helpers.arrayElement(POSITIONS);
    const salary = faker.number.int({ min: 50000, max: 120000 });
    const email = faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] });
    const employee = await Employee.create({
      name,
      email,
      position,
      department,
      salary,
      status: 'active',
      createdBy: (await User.findOne())?._id || undefined
    });
    employees.push(employee);
  }
  console.log(`Created ${employees.length} employees.`);

  // Create timesheets for last 3 months
  const timesheets = [];
  const today = new Date();
  for (let emp of employees) {
    for (let d = 0; d < 60; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends
      const startTime = '09:00';
      const endTime = faker.helpers.arrayElement(['17:00', '18:00', '16:30']);
      const breakTime = faker.number.int({ min: 30, max: 90 });
      const project = faker.helpers.arrayElement(PROJECTS);
      const notes = faker.lorem.sentence();
      const totalHours = ((parseInt(endTime) - 9) + (endTime.endsWith('30') ? 0.5 : 0)) - (breakTime / 60);
      const overtimeHours = Math.max(0, totalHours - 8);
      const status = faker.helpers.arrayElement(['approved', 'pending', 'rejected']);
      timesheets.push({
        employee: emp._id,
        date,
        startTime,
        endTime,
        breakTime,
        project,
        notes,
        totalHours,
        overtimeHours,
        status
      });
    }
  }
  await Timesheet.insertMany(timesheets);
  console.log(`Created ${timesheets.length} timesheets.`);

  // Create payrolls for last 3 months (monthly)
  for (let m = 0; m < 3; m++) {
    const periodDate = new Date(today);
    periodDate.setMonth(today.getMonth() - m);
    const period = periodDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const startDate = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
    const endDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);
    const payrollItems = employees.map(emp => {
      const baseSalary = emp.salary / 12;
      const deductions = baseSalary * 0.15;
      const taxes = baseSalary * 0.25;
      const netPay = baseSalary - deductions - taxes;
      return {
        employee: emp._id,
        baseSalary,
        hoursWorked: 160,
        overtimeHours: faker.number.int({ min: 0, max: 20 }),
        overtimeRate: 0,
        bonuses: 0,
        deductions,
        taxes,
        netPay,
        status: 'paid'
      };
    });
    const totalAmount = payrollItems.reduce((sum, item) => sum + item.baseSalary, 0);
    const totalDeductions = payrollItems.reduce((sum, item) => sum + item.deductions, 0);
    const totalTaxes = payrollItems.reduce((sum, item) => sum + item.taxes, 0);
    const netAmount = payrollItems.reduce((sum, item) => sum + item.netPay, 0);
    await Payroll.create({
      period,
      startDate,
      endDate,
      type: 'monthly',
      totalAmount,
      employeeCount: employees.length,
      deductions: totalDeductions,
      taxes: totalTaxes,
      netAmount,
      payrollItems,
      notes: 'Seeded payroll',
      processedBy: (await User.findOne())?._id || undefined,
      processedAt: new Date(),
      status: 'paid'
    });
  }
  console.log('Created payrolls for last 3 months.');

  mongoose.connection.close();
  console.log('Seeding complete!');
}

seed().catch(err => {
  console.error(err);
  mongoose.connection.close();
}); 