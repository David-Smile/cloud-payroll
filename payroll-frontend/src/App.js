import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Settings,
  Printer
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Smith', position: 'Software Engineer', salary: 85000, status: 'active', email: 'john.smith@company.com', department: 'Engineering' },
    { id: 2, name: 'Sarah Johnson', position: 'Product Manager', salary: 95000, status: 'active', email: 'sarah.johnson@company.com', department: 'Product' },
    { id: 3, name: 'Mike Davis', position: 'UX Designer', salary: 75000, status: 'active', email: 'mike.davis@company.com', department: 'Design' },
    { id: 4, name: 'Emily Wilson', position: 'Marketing Specialist', salary: 65000, status: 'inactive', email: 'emily.wilson@company.com', department: 'Marketing' },
    { id: 5, name: 'David Brown', position: 'Data Analyst', salary: 70000, status: 'active', email: 'david.brown@company.com', department: 'Analytics' },
    { id: 6, name: 'Lisa Garcia', position: 'HR Manager', salary: 80000, status: 'active', email: 'lisa.garcia@company.com', department: 'Human Resources' },
  ]);
  const [payrollPeriod, setPayrollPeriod] = useState('biweekly');
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showPayrollPreview, setShowPayrollPreview] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [showPayrollHistoryModal, setShowPayrollHistoryModal] = useState(false);
  const [showPayrollDetailsModal, setShowPayrollDetailsModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([
    { id: 1, period: 'Dec 2024', amount: 185000, status: 'processed', date: '2024-12-15' },
    { id: 2, period: 'Nov 2024', amount: 182000, status: 'processed', date: '2024-11-15' },
    { id: 3, period: 'Oct 2024', amount: 180000, status: 'processed', date: '2024-10-15' },
  ]);

  // Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Mock data for demonstration
  const payrollStats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    totalPayroll: employees.reduce((sum, emp) => sum + emp.salary, 0),
    pendingPayments: 3
  };

  const recentPayrolls = payrollHistory.slice(0, 3); // Get the 3 most recent payrolls

  // Filter employees based on search term and status filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setShowFilterModal(false);
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Position', 'Salary', 'Status', 'Email', 'Department'],
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.position,
        emp.salary,
        emp.status,
        emp.email,
        emp.department
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle view employee
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
    setShowDeleteModal(false);
    setSelectedEmployee(null);
  };

  // Handle add employee
  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  // Add new employee
  const addNewEmployee = (newEmployee) => {
    const employee = {
      ...newEmployee,
      id: Math.max(...employees.map(emp => emp.id)) + 1,
      salary: parseInt(newEmployee.salary)
    };
    setEmployees([...employees, employee]);
    setShowAddModal(false);
  };

  // Update employee
  const updateEmployee = (updatedEmployee) => {
    setEmployees(employees.map(emp => 
      emp.id === selectedEmployee.id ? { ...updatedEmployee, id: emp.id, salary: parseInt(updatedEmployee.salary) } : emp
    ));
    setShowEditModal(false);
    setSelectedEmployee(null);
  };

  // Payroll handlers
  const handleProcessPayroll = () => {
    setProcessingPayroll(true);
    // Simulate payroll processing
    setTimeout(() => {
      setProcessingPayroll(false);
      
      // Create new payroll record
      const newPayroll = {
        id: Math.max(...payrollHistory.map(p => p.id)) + 1,
        period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: payrollStats.totalPayroll,
        status: 'processed',
        date: new Date().toISOString().split('T')[0]
      };
      
      // Add new payroll to history
      setPayrollHistory([newPayroll, ...payrollHistory]);
      
      // Show success message
      alert('Payroll processed successfully!');
    }, 2000);
  };

  const handlePreviewPayroll = () => {
    setShowPayrollPreview(true);
  };

  const handleExportPayrollReport = () => {
    const csvContent = [
      ['Employee', 'Position', 'Gross Pay', 'Taxes', 'Benefits', 'Net Pay'],
      ...employees.filter(emp => emp.status === 'active').map(emp => {
        const grossPay = emp.salary / 12;
        const taxes = grossPay * 0.25;
        const benefits = grossPay * 0.15;
        const netPay = grossPay - taxes - benefits;
        return [
          emp.name,
          emp.position,
          grossPay.toLocaleString(),
          taxes.toLocaleString(),
          benefits.toLocaleString(),
          netPay.toLocaleString()
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintPayroll = () => {
    // Create a print-friendly version of the payroll report
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payroll Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { margin-bottom: 30px; }
            .summary h3 { color: #333; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
            .summary-item { padding: 10px; background: #f8f9fa; border-radius: 5px; }
            .summary-item strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .total-row { font-weight: bold; background-color: #f8f9fa; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payroll Report</h1>
            <p>Period: ${payrollPeriod} | Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Payroll Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <strong>Total Employees:</strong> ${payrollStats.activeEmployees}
              </div>
              <div class="summary-item">
                <strong>Gross Pay:</strong> $${payrollStats.totalPayroll.toLocaleString()}
              </div>
              <div class="summary-item">
                <strong>Estimated Taxes:</strong> $${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}
              </div>
              <div class="summary-item">
                <strong>Benefits:</strong> $${Math.round(payrollStats.totalPayroll * 0.15).toLocaleString()}
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Gross Pay</th>
                <th>Taxes</th>
                <th>Benefits</th>
                <th>Net Pay</th>
              </tr>
            </thead>
            <tbody>
              ${employees.filter(emp => emp.status === 'active').map(emp => {
                const grossPay = emp.salary / 12;
                const taxes = grossPay * 0.25;
                const benefits = grossPay * 0.15;
                const netPay = grossPay - taxes - benefits;
                return `
                  <tr>
                    <td>${emp.name}</td>
                    <td>${emp.position}</td>
                    <td>${emp.department}</td>
                    <td>$${grossPay.toLocaleString()}</td>
                    <td>$${taxes.toLocaleString()}</td>
                    <td>$${benefits.toLocaleString()}</td>
                    <td>$${netPay.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>$${payrollStats.totalPayroll.toLocaleString()}</strong></td>
                <td><strong>$${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}</strong></td>
                <td><strong>$${Math.round(payrollStats.totalPayroll * 0.15).toLocaleString()}</strong></td>
                <td><strong>$${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>This report was generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handlePayrollPeriodChange = (period) => {
    setPayrollPeriod(period);
  };

  // Additional payroll handlers
  const handleViewAllPayrollHistory = () => {
    setShowPayrollHistoryModal(true);
  };

  const handleViewPayrollDetails = (payroll) => {
    setSelectedPayroll(payroll);
    setShowPayrollDetailsModal(true);
  };

  const handleDownloadPayroll = (payroll) => {
    const csvContent = [
      ['Payroll Period', 'Date', 'Employees', 'Gross Pay', 'Net Pay', 'Status'],
      [
        payroll.period,
        payroll.date,
        payrollStats.activeEmployees.toString(),
        `$${payroll.amount.toLocaleString()}`,
        `$${Math.round(payroll.amount * 0.6).toLocaleString()}`,
        payroll.status
      ]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${payroll.period.replace(' ', '_')}_${payroll.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Settings handler
  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const EmployeeCard = ({ employee }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">${employee.salary.toLocaleString()}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            employee.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {employee.status}
          </span>
        </div>
      </div>
    </div>
  );

  const PayrollCard = ({ payroll }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{payroll.period}</h3>
          <p className="text-sm text-gray-500">{payroll.date}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">${payroll.amount.toLocaleString()}</p>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {payroll.status}
          </span>
        </div>
      </div>
    </div>
  );

  // Modal components
  const EmployeeModal = ({ isOpen, onClose, employee, onSubmit, mode }) => {
    const [formData, setFormData] = useState(employee || {
      name: '',
      position: '',
      salary: '',
      email: '',
      department: '',
      status: 'active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      setFormData({ name: '', position: '', salary: '', email: '', department: '', status: 'active' });
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{mode === 'add' ? 'Add Employee' : 'Edit Employee'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {mode === 'add' ? 'Add Employee' : 'Update Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteModal = ({ isOpen, onClose, onConfirm, employee }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Delete Employee</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{employee?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const FilterModal = ({ isOpen, onClose, currentFilter, onFilterChange }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filter Employees</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="all"
                    checked={currentFilter === 'all'}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="mr-2"
                  />
                  All Employees
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={currentFilter === 'active'}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="mr-2"
                  />
                  Active Only
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={currentFilter === 'inactive'}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="mr-2"
                  />
                  Inactive Only
                </label>
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ViewEmployeeModal = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Employee Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-bold text-xl">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
                <p className="text-lg text-gray-600">{employee.position}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  employee.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Employee Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Email Address
                  </label>
                  <p className="mt-1 text-lg text-gray-900">{employee.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Department
                  </label>
                  <p className="mt-1 text-lg text-gray-900">{employee.department}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Annual Salary
                  </label>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    ${employee.salary.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Employee ID
                  </label>
                  <p className="mt-1 text-lg text-gray-900">#{employee.id.toString().padStart(4, '0')}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Monthly Salary:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    ${Math.round(employee.salary / 12).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Bi-weekly Pay:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    ${Math.round(employee.salary / 26).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onClose();
                  setSelectedEmployee(employee);
                  setShowEditModal(true);
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Employee</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Payroll Preview Modal
  const PayrollPreviewModal = ({ isOpen, onClose, onConfirm, employees, payrollStats, payrollPeriod }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Payroll Preview</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 mb-2">You are about to process payroll for the following period:</p>
            <div className="flex items-center space-x-4 mb-2">
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                {payrollPeriod.charAt(0).toUpperCase() + payrollPeriod.slice(1)}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">Employees</div>
                <div className="text-xl font-bold">{payrollStats.activeEmployees}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">Gross Pay</div>
                <div className="text-xl font-bold">${payrollStats.totalPayroll.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">Taxes (Est.)</div>
                <div className="text-xl font-bold">${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">Net Pay</div>
                <div className="text-xl font-bold text-green-600">${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.filter(emp => emp.status === 'active').map(emp => {
                  const grossPay = emp.salary / 12;
                  const taxes = grossPay * 0.25;
                  const benefits = grossPay * 0.15;
                  const netPay = grossPay - taxes - benefits;
                  return (
                    <tr key={emp.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{emp.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{emp.position}</td>
                      <td className="px-4 py-2 whitespace-nowrap">${grossPay.toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-green-600">${netPay.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-4 h-4" />
              <span>Confirm & Process Payroll</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PayrollConfirmationModal = ({ isOpen, onClose, payrollStats, payrollPeriod }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-700 flex items-center space-x-2">
              <span>Payroll Processed</span>
              <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-semibold ml-2">Success</span>
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 mb-2">Payroll for the following period has been processed:</p>
            <div className="flex items-center space-x-4 mb-2">
              <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                {payrollPeriod.charAt(0).toUpperCase() + payrollPeriod.slice(1)}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">Employees</div>
                <div className="text-xl font-bold">{payrollStats.activeEmployees}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-xs text-gray-500">Net Pay</div>
                <div className="text-xl font-bold text-green-600">${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PayrollHistoryModal = ({ isOpen, onClose, payrolls, payrollStats }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Complete Payroll History</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payroll Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payroll.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payroll.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payrollStats.activeEmployees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payroll.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Math.round(payroll.amount * 0.6).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleViewPayrollDetails(payroll)}
                          className="text-primary-600 hover:text-primary-900" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPayroll(payroll)}
                          className="text-green-600 hover:text-green-900" 
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PayrollDetailsModal = ({ isOpen, onClose, payroll, employees }) => {
    if (!isOpen || !payroll) return null;
    
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    const totalGrossPay = activeEmployees.reduce((sum, emp) => sum + (emp.salary / 12), 0);
    const totalTaxes = totalGrossPay * 0.25;
    const totalBenefits = totalGrossPay * 0.15;
    const totalNetPay = totalGrossPay - totalTaxes - totalBenefits;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payroll Details - {payroll.period}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Payroll Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{payroll.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{payroll.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">{payroll.status}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Financial Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Pay:</span>
                  <span className="font-medium">${payroll.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes:</span>
                  <span className="font-medium">${Math.round(payroll.amount * 0.25).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Benefits:</span>
                  <span className="font-medium">${Math.round(payroll.amount * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Net Pay:</span>
                  <span className="text-green-600">${Math.round(payroll.amount * 0.6).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Employees:</span>
                  <span className="font-medium">{activeEmployees.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Salary:</span>
                  <span className="font-medium">${Math.round(totalGrossPay / activeEmployees.length).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benefits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeEmployees.map((employee) => {
                  const grossPay = employee.salary / 12;
                  const taxes = grossPay * 0.25;
                  const benefits = grossPay * 0.15;
                  const netPay = grossPay - taxes - benefits;
                  
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-medium text-sm">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${grossPay.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${taxes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${benefits.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${netPay.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Settings Modal
  const SettingsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Application Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Company Name:</span> Cloud Payroll Inc.</div>
                <div><span className="font-medium">Version:</span> 1.0.0</div>
                <div><span className="font-medium">Contact:</span> admin@cloudpayroll.com</div>
                <div><span className="font-medium">Support:</span> support@cloudpayroll.com</div>
              </div>
            </div>

            {/* Application Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Application Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Dark Mode</span>
                  <button 
                    onClick={handleToggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-5' : 'translate-x-1'
                    }`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Total Employees:</span> {payrollStats.totalEmployees}</div>
                <div><span className="font-medium">Active Employees:</span> {payrollStats.activeEmployees}</div>
                <div><span className="font-medium">Total Payroll:</span> ${payrollStats.totalPayroll.toLocaleString()}</div>
                <div><span className="font-medium">Last Updated:</span> {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  Export Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  Backup Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                  View Logs
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary-600">Cloud Payroll</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleOpenSettings}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'timesheets', label: 'Timesheets', icon: Clock },
              { id: 'payroll', label: 'Payroll', icon: DollarSign },
              { id: 'reports', label: 'Reports', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={Users} 
                title="Total Employees" 
                value={payrollStats.totalEmployees}
                change={5}
                color="blue"
              />
              <StatCard 
                icon={Clock} 
                title="Active Employees" 
                value={payrollStats.activeEmployees}
                color="green"
              />
              <StatCard 
                icon={DollarSign} 
                title="Total Payroll" 
                value={`$${payrollStats.totalPayroll.toLocaleString()}`}
                change={2.5}
                color="yellow"
              />
              <StatCard 
                icon={Calendar} 
                title="Pending Payments" 
                value={payrollStats.pendingPayments}
                color="red"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Employees */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Recent Employees</h2>
                    <button 
                      onClick={() => setActiveTab('employees')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {employees.slice(0, 3).map((employee) => (
                    <EmployeeCard key={employee.id} employee={employee} />
                  ))}
                </div>
              </div>

              {/* Recent Payrolls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Recent Payrolls</h2>
                    <button 
                      onClick={handleViewAllPayrollHistory}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {recentPayrolls.map((payroll) => (
                    <PayrollCard key={payroll.id} payroll={payroll} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
              <button 
                onClick={handleAddEmployee}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setShowFilterModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  {statusFilter !== 'all' && (
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      {statusFilter}
                    </span>
                  )}
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-medium text-sm">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${employee.salary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewEmployee(employee)}
                            className="text-primary-600 hover:text-primary-900" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="text-blue-600 hover:text-blue-900" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(employee)}
                            className="text-red-600 hover:text-red-900" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'timesheets' && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Timesheets</h3>
            <p className="mt-1 text-sm text-gray-500">Timesheet management coming soon.</p>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="space-y-6">
            {/* Payroll Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                <p className="text-gray-600 mt-1">Process payroll, view payment history, and manage employee compensation</p>
              </div>
            </div>

            {/* Payroll Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">${payrollStats.totalPayroll.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{payrollStats.activeEmployees}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{payrollStats.pendingPayments}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Next Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">Dec 15</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Processing Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payroll Processing</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payroll Period Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Select Payroll Period</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="biweekly"
                          name="payrollPeriod"
                          value="biweekly"
                          checked={payrollPeriod === 'biweekly'}
                          onChange={(e) => handlePayrollPeriodChange(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="biweekly" className="text-sm text-gray-700">
                          Bi-weekly (Every 2 weeks)
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="monthly"
                          name="payrollPeriod"
                          value="monthly"
                          checked={payrollPeriod === 'monthly'}
                          onChange={(e) => handlePayrollPeriodChange(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="monthly" className="text-sm text-gray-700">
                          Monthly
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="custom"
                          name="payrollPeriod"
                          value="custom"
                          checked={payrollPeriod === 'custom'}
                          onChange={(e) => handlePayrollPeriodChange(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="custom" className="text-sm text-gray-700">
                          Custom Period
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Payroll Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Payroll Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Employees:</span>
                        <span className="font-medium">{payrollStats.activeEmployees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Pay:</span>
                        <span className="font-medium">${payrollStats.totalPayroll.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes (Est.):</span>
                        <span className="font-medium">${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Benefits:</span>
                        <span className="font-medium">${Math.round(payrollStats.totalPayroll * 0.15).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Net Pay:</span>
                        <span className="text-green-600">${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={handleProcessPayroll}
                    disabled={processingPayroll}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPayroll ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Process Payroll</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handlePreviewPayroll}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Preview Payroll
                  </button>
                  <button 
                    onClick={handleExportPayrollReport}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Export Report
                  </button>
                  <button 
                    onClick={handlePrintPayroll}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Print Report
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Payroll History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Payroll History</h2>
                  <button 
                    onClick={handleViewAllPayrollHistory}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentPayrolls.map((payroll) => (
                    <div key={payroll.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{payroll.period}</h3>
                        <p className="text-sm text-gray-500">{payroll.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${payroll.amount.toLocaleString()}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {payroll.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewPayrollDetails(payroll)}
                          className="text-primary-600 hover:text-primary-900" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPayroll(payroll)}
                          className="text-green-600 hover:text-green-900" 
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Generate comprehensive reports and view analytics</p>
              </div>
              <button 
                onClick={() => {
                  const csvContent = [
                    ['Report Type', 'Generated Date', 'Total Employees', 'Total Payroll'],
                    ['Payroll Summary', new Date().toLocaleDateString(), payrollStats.totalEmployees, `$${payrollStats.totalPayroll.toLocaleString()}`],
                    ['Employee Summary', new Date().toLocaleDateString(), payrollStats.totalEmployees, 'N/A'],
                    ['Tax Summary', new Date().toLocaleDateString(), payrollStats.activeEmployees, `$${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}`],
                  ].map(row => row.join(',')).join('\n');

                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `reports_summary_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export All Reports</span>
              </button>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Payroll Report Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <button 
                    onClick={() => {
                      const csvContent = [
                        ['Employee', 'Position', 'Salary', 'Monthly Pay', 'Taxes', 'Benefits', 'Net Pay'],
                        ...employees.map(emp => {
                          const monthlyPay = emp.salary / 12;
                          const taxes = monthlyPay * 0.25;
                          const benefits = monthlyPay * 0.15;
                          const netPay = monthlyPay - taxes - benefits;
                          return [
                            emp.name,
                            emp.position,
                            emp.salary,
                            monthlyPay.toLocaleString(),
                            taxes.toLocaleString(),
                            benefits.toLocaleString(),
                            netPay.toLocaleString()
                          ];
                        })
                      ].map(row => row.join(',')).join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `payroll_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Export
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payroll Report</h3>
                <p className="text-gray-600 text-sm mb-4">Detailed payroll breakdown for all employees</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Payroll:</span>
                    <span className="font-medium">${payrollStats.totalPayroll.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Employees:</span>
                    <span className="font-medium">{payrollStats.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Salary:</span>
                    <span className="font-medium">${Math.round(payrollStats.totalPayroll / payrollStats.totalEmployees).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Employee Report Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <button 
                    onClick={() => {
                      const csvContent = [
                        ['Name', 'Position', 'Department', 'Salary', 'Status', 'Email'],
                        ...employees.map(emp => [
                          emp.name,
                          emp.position,
                          emp.department,
                          emp.salary,
                          emp.status,
                          emp.email
                        ])
                      ].map(row => row.join(',')).join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `employee_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Export
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Report</h3>
                <p className="text-gray-600 text-sm mb-4">Complete employee information and statistics</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Employees:</span>
                    <span className="font-medium">{payrollStats.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium text-green-600">{payrollStats.activeEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inactive:</span>
                    <span className="font-medium text-gray-600">{payrollStats.totalEmployees - payrollStats.activeEmployees}</span>
                  </div>
                </div>
              </div>

              {/* Tax Report Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <button 
                    onClick={() => {
                      const csvContent = [
                        ['Tax Type', 'Rate', 'Amount', 'Description'],
                        ['Federal Tax', '25%', `$${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}`, 'Federal income tax'],
                        ['State Tax', '8%', `$${Math.round(payrollStats.totalPayroll * 0.08).toLocaleString()}`, 'State income tax'],
                        ['Social Security', '6.2%', `$${Math.round(payrollStats.totalPayroll * 0.062).toLocaleString()}`, 'Social Security tax'],
                        ['Medicare', '1.45%', `$${Math.round(payrollStats.totalPayroll * 0.0145).toLocaleString()}`, 'Medicare tax'],
                        ['Unemployment', '6%', `$${Math.round(payrollStats.totalPayroll * 0.06).toLocaleString()}`, 'Unemployment insurance'],
                      ].map(row => row.join(',')).join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `tax_report_${new Date().toISOString().split('T')[0]}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                  >
                    Export
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Report</h3>
                <p className="text-gray-600 text-sm mb-4">Tax calculations and deductions summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Taxes:</span>
                    <span className="font-medium">${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Federal Tax:</span>
                    <span className="font-medium">${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">State Tax:</span>
                    <span className="font-medium">${Math.round(payrollStats.totalPayroll * 0.08).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payroll History Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Payroll History</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {payrollHistory.map((payroll) => (
                      <div key={payroll.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{payroll.period}</h3>
                          <p className="text-sm text-gray-500">{payroll.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${payroll.amount.toLocaleString()}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {payroll.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Department Breakdown</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from(new Set(employees.map(emp => emp.department))).map((dept) => {
                      const deptEmployees = employees.filter(emp => emp.department === dept);
                      const deptSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0);
                      return (
                        <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-gray-900">{dept}</h3>
                            <p className="text-sm text-gray-500">{deptEmployees.length} employees</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${deptSalary.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Total Salary</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Analytics Summary</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{payrollStats.totalEmployees}</div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{payrollStats.activeEmployees}</div>
                    <div className="text-sm text-gray-600">Active Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">${Math.round(payrollStats.totalPayroll / payrollStats.totalEmployees).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Average Salary</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${payrollStats.totalPayroll.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Payroll</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <EmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={addNewEmployee}
        mode="add"
      />
      
      <EmployeeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSubmit={updateEmployee}
        mode="edit"
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEmployee(null);
        }}
        onConfirm={confirmDelete}
        employee={selectedEmployee}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilter={statusFilter}
        onFilterChange={handleStatusFilter}
      />

      <ViewEmployeeModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        employee={selectedEmployee}
      />

      <PayrollPreviewModal
        isOpen={showPayrollPreview}
        onClose={() => setShowPayrollPreview(false)}
        onConfirm={() => {
          setShowPayrollPreview(false);
          handleProcessPayroll();
        }}
        employees={employees}
        payrollStats={payrollStats}
        payrollPeriod={payrollPeriod}
      />

      <PayrollConfirmationModal
        isOpen={showPayrollModal}
        onClose={() => setShowPayrollModal(false)}
        payrollStats={payrollStats}
        payrollPeriod={payrollPeriod}
      />

      <PayrollHistoryModal
        isOpen={showPayrollHistoryModal}
        onClose={() => setShowPayrollHistoryModal(false)}
        payrolls={payrollHistory}
        payrollStats={payrollStats}
      />

      <PayrollDetailsModal
        isOpen={showPayrollDetailsModal}
        onClose={() => setShowPayrollDetailsModal(false)}
        payroll={selectedPayroll}
        employees={employees}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}

export default App;
