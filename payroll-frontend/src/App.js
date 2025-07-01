import React, { useState, createContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  DollarSign, 
  Calendar, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Settings,
  Printer,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  User,
  FileText,
  Info
} from 'lucide-react';
import './App.css';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';
import { apiFetch } from './api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Authentication Context
export const AuthContext = createContext();

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [userInfo, setUserInfo] = useState(null);

  // Login function
  const login = (userData, rememberMe = false) => {
    setIsAuthenticated(true);
    setUserRole(userData.role);
    setUserInfo(userData);
    if (rememberMe) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
    setUserInfo(null);
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  // Check for stored authentication on app load
  React.useEffect(() => {
    const storedUser = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      login(userData, !!localStorage.getItem('userData'));
    }
  }, []);

  const authContextValue = {
    isAuthenticated,
    userRole,
    userInfo,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

// Dashboard Component
const Dashboard = () => {
  const { userRole, userInfo, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [payrollPeriod, setPayrollPeriod] = useState('biweekly');
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showPayrollPreview, setShowPayrollPreview] = useState(false);
  const [processingPayroll, setProcessingPayroll] = useState(false);
  const [showPayrollHistoryModal, setShowPayrollHistoryModal] = useState(false);
  const [showPayrollDetailsModal, setShowPayrollDetailsModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [payrollHistory, setPayrollHistory] = useState([]);

  // Timesheet state
  const [timesheets, setTimesheets] = useState([]);

  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [showTimesheetDetailsModal, setShowTimesheetDetailsModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [timesheetFilter, setTimesheetFilter] = useState('all');
  const [timesheetSearchTerm, setTimesheetSearchTerm] = useState('');

  // Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Profile state
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // Mock data for demonstration
  const payrollStats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    totalPayroll: employees.reduce((sum, emp) => sum + emp.salary, 0),
    pendingPayments: 3,
    nextPayrollDate: 'Dec 15'
  };

  const recentPayrolls = payrollHistory.slice(0, 3); // Get the 3 most recent payrolls

  // Filter employees based on search term and status filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = (employee.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (employee.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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
  const confirmDelete = async () => {
    try {
      const { response, data } = await apiFetch(`/employees/${selectedEmployee._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok && data.success) {
        setEmployees(employees.filter(emp => emp._id !== selectedEmployee._id));
        setShowDeleteModal(false);
        setSelectedEmployee(null);
      } else {
        alert(data.message || 'Failed to delete employee');
      }
    } catch (error) {
      alert('Error deleting employee');
    }
  };

  // Handle add employee
  const handleAddEmployee = () => {
    setShowAddModal(true);
  };

  // Add new employee
  const addNewEmployee = async (newEmployee) => {
    try {
      const { response, data } = await apiFetch('/employees', {
        method: 'POST',
        body: JSON.stringify(newEmployee)
      });
      
      if (response.ok && data.success) {
        setEmployees([...employees, data.employee]);
        setShowAddModal(false);
      } else {
        alert(data.message || 'Failed to add employee');
      }
    } catch (error) {
      alert('Error adding employee');
    }
  };

  // Update employee
  const updateEmployee = async (updatedEmployee) => {
    try {
      const { response, data } = await apiFetch(`/employees/${selectedEmployee._id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedEmployee)
      });
      
      if (response.ok && data.success) {
        setEmployees(employees.map(emp => 
          emp._id === selectedEmployee._id ? data.employee : emp
        ));
        setShowEditModal(false);
        setSelectedEmployee(null);
      } else {
        alert(data.message || 'Failed to update employee');
      }
    } catch (error) {
      alert('Error updating employee');
    }
  };

  // Payroll handlers
  const handleProcessPayroll = async () => {
    setProcessingPayroll(true);
    try {
      const { response, data } = await apiFetch('/payroll', {
        method: 'POST',
        body: JSON.stringify({
          period: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          type: payrollPeriod,
          notes: 'Payroll processed via frontend'
        })
      });
      
      if (response.ok && data.success) {
        setPayrollHistory([data.payroll, ...payrollHistory]);
        alert('Payroll processed successfully!');
      } else {
        alert(data.message || 'Failed to process payroll');
      }
    } catch (error) {
      alert('Error processing payroll');
    } finally {
      setProcessingPayroll(false);
    }
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
      ['Period', 'Net Amount', 'Status', 'Date'],
      [payroll.period, payroll.netAmount || 0, payroll.status, new Date(payroll.createdAt).toLocaleDateString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${payroll.period.replace(' ', '_')}_${new Date(payroll.createdAt).toISOString().split('T')[0]}.csv`;
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

  // Profile handlers
  const handleSwitchUser = () => {
    setIsLoggedOut(false);
  };

  // Add state for KPI modals
  const [showKpiModal, setShowKpiModal] = useState(null); // 'totalPayroll', 'activeEmployees', 'pendingPayments', 'nextPayrollDate', or null

  // Update StatCard to be clickable
  const StatCard = ({ icon: Icon, title, value, change, color = 'blue', onClick }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 stat-card cursor-pointer hover:shadow-lg transition-shadow duration-200 ${onClick ? 'ring-1 ring-primary-200' : ''}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? 'false' : undefined}
      style={{ outline: 'none' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate stat-value">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-full bg-${color}-100 flex-shrink-0 ml-3`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const EmployeeCard = ({ employee }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-semibold text-sm sm:text-base">
              {(employee.name || '').split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{employee.name || 'Unknown Employee'}</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{employee.position || 'No Position'}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="font-medium text-gray-900 text-sm sm:text-base">${(employee.salary || 0).toLocaleString()}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            employee.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {(employee.status || '').charAt(0).toUpperCase() + (employee.status || '').slice(1)}
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
          <p className="text-sm text-gray-500">{new Date(payroll.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">${(payroll.netAmount || 0).toLocaleString()}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            payroll.status === 'processed' ? 'bg-green-100 text-green-800' :
            payroll.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
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
                  {(employee.name || '').split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{employee.name || 'Unknown Employee'}</h3>
                <p className="text-lg text-gray-600">{employee.position || 'No Position'}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  employee.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(employee.status || '').charAt(0).toUpperCase() + (employee.status || '').slice(1)}
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
                  <p className="mt-1 text-lg text-gray-900">{employee.email || 'No Email'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Department
                  </label>
                  <p className="mt-1 text-lg text-gray-900">{employee.department || 'No Department'}</p>
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
                  <p className="mt-1 text-lg text-gray-900">#{employee._id.toString().padStart(4, '0')}</p>
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
                    <tr key={emp._id}>
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
                  <tr key={payroll._id} className="hover:bg-gray-50">
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
                      ${(payroll.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(payroll.netAmount || 0).toLocaleString()}
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
                  <span className="font-medium">${(payroll.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes:</span>
                  <span className="font-medium">${(payroll.taxes || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Benefits:</span>
                  <span className="font-medium">${(payroll.deductions || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Net Pay:</span>
                  <span className="text-green-600">${(payroll.netAmount || 0).toLocaleString()}</span>
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
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-medium text-sm">
                              {(employee.name || '').split(' ').map(n => n[0]).join('')}
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

  // Timesheet handlers
  const handleAddTimesheet = () => {
    setSelectedTimesheet(null);
    setShowTimesheetModal(true);
  };

  const handleEditTimesheet = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowTimesheetModal(true);
  };

  const handleViewTimesheet = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowTimesheetDetailsModal(true);
  };

  const handleDeleteTimesheet = async (timesheet) => {
    try {
      const { response, data } = await apiFetch(`/timesheets/${timesheet._id}`, {
        method: 'DELETE'
      });
      
      if (response.ok && data.success) {
        setTimesheets(timesheets.filter(ts => ts._id !== timesheet._id));
      } else {
        alert(data.message || 'Failed to delete timesheet');
      }
    } catch (error) {
      alert('Error deleting timesheet');
    }
  };

  const handleApproveTimesheet = async (timesheet) => {
    try {
      const { response, data } = await apiFetch(`/timesheets/${timesheet._id}/approve`, {
        method: 'POST'
      });
      
      if (response.ok && data.success) {
        setTimesheets(timesheets.map(ts => 
          ts._id === timesheet._id ? data.timesheet : ts
        ));
      } else {
        alert(data.message || 'Failed to approve timesheet');
      }
    } catch (error) {
      alert('Error approving timesheet');
    }
  };

  const handleRejectTimesheet = async (timesheet) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const { response, data } = await apiFetch(`/timesheets/${timesheet._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason: reason })
      });
      
      if (response.ok && data.success) {
        setTimesheets(timesheets.map(ts => 
          ts._id === timesheet._id ? data.timesheet : ts
        ));
      } else {
        alert(data.message || 'Failed to reject timesheet');
      }
    } catch (error) {
      alert('Error rejecting timesheet');
    }
  };

  const handleTimesheetSearch = (e) => {
    setTimesheetSearchTerm(e.target.value);
  };

  const handleTimesheetFilter = (filter) => {
    setTimesheetFilter(filter);
  };

  const handleExportTimesheets = () => {
    const csvContent = [
      ['Employee', 'Date', 'Start Time', 'End Time', 'Break (min)', 'Total Hours', 'Status', 'Project', 'Notes'],
      ...filteredTimesheets.map(ts => [
        ts.employeeName,
        ts.date,
        ts.startTime,
        ts.endTime,
        ts.breakTime,
        ts.totalHours,
        ts.status,
        ts.project,
        ts.notes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintTimesheets = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timesheet Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { margin-bottom: 30px; }
            .summary h3 { color: #333; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 15px; }
            .summary-item { padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center; }
            .summary-item strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status-approved { color: #059669; font-weight: bold; }
            .status-pending { color: #d97706; font-weight: bold; }
            .status-rejected { color: #dc2626; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Timesheet Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <strong>Total Entries</strong><br>
                ${filteredTimesheets.length}
              </div>
              <div class="summary-item">
                <strong>Total Hours</strong><br>
                ${filteredTimesheets.reduce((sum, ts) => sum + ts.totalHours, 0).toFixed(2)}
              </div>
              <div class="summary-item">
                <strong>Pending Approval</strong><br>
                ${filteredTimesheets.filter(ts => ts.status === 'pending').length}
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Break</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Project</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTimesheets.map(ts => `
                <tr>
                  <td>${ts.employeeName}</td>
                  <td>${ts.date}</td>
                  <td>${ts.startTime}</td>
                  <td>${ts.endTime}</td>
                  <td>${ts.breakTime} min</td>
                  <td>${ts.totalHours}</td>
                  <td class="status-${ts.status}">${ts.status}</td>
                  <td>${ts.project}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Utility function to safely get employee name from timesheet
  const getTimesheetEmployeeName = (timesheet) => {
    return timesheet.employee?.name || timesheet.employeeName || 'Unknown Employee';
  };

  // Filter timesheets
  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesSearch = (timesheet.employee?.name || '').toLowerCase().includes(timesheetSearchTerm.toLowerCase()) ||
                         (timesheet.project || '').toLowerCase().includes(timesheetSearchTerm.toLowerCase());
    const matchesFilter = timesheetFilter === 'all' || timesheet.status === timesheetFilter;
    return matchesSearch && matchesFilter;
  });

  // Timesheet statistics
  const timesheetStats = {
    totalEntries: timesheets.length,
    totalHours: timesheets.reduce((sum, ts) => sum + ts.totalHours, 0),
    pendingApproval: timesheets.filter(ts => ts.status === 'pending').length,
    approved: timesheets.filter(ts => ts.status === 'approved').length,
    averageHoursPerDay: timesheets.length > 0 ? (timesheets.reduce((sum, ts) => sum + ts.totalHours, 0) / timesheets.length).toFixed(2) : 0
  };

  // Fetch employees from backend on mount
  React.useEffect(() => {
    async function fetchEmployees() {
      try {
        const { response, data } = await apiFetch('/employees');
        if (response.ok && data.success) {
          setEmployees(data.employees || []);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        setEmployees([]);
      }
    }
    fetchEmployees();
  }, []);

  // Fetch payroll history from backend on mount
  React.useEffect(() => {
    async function fetchPayrolls() {
      try {
        const { response, data } = await apiFetch('/payroll');
        if (response.ok && data.success) {
          setPayrollHistory(data.payrolls || []);
        } else {
          setPayrollHistory([]);
        }
      } catch (err) {
        setPayrollHistory([]);
      }
    }
    fetchPayrolls();
  }, []);

  // Fetch timesheets from backend on mount
  React.useEffect(() => {
    async function fetchTimesheets() {
      try {
        const { response, data } = await apiFetch('/timesheets');
        if (response.ok && data.success) {
          setTimesheets(data.timesheets || []);
        } else {
          setTimesheets([]);
        }
      } catch (err) {
        setTimesheets([]);
      }
    }
    fetchTimesheets();
  }, []);

  // Add new timesheet
  const addNewTimesheet = async (newTimesheet) => {
    try {
      const { response, data } = await apiFetch('/timesheets', {
        method: 'POST',
        body: JSON.stringify({
          employee: newTimesheet.employeeId,
          date: newTimesheet.date,
          startTime: newTimesheet.startTime,
          endTime: newTimesheet.endTime,
          breakTime: newTimesheet.breakTime,
          project: newTimesheet.project,
          task: '',
          notes: newTimesheet.notes,
          location: '',
          tags: []
        })
      });
      
      if (response.ok && data.success) {
        setTimesheets([...timesheets, data.timesheet]);
        setShowTimesheetModal(false);
      } else {
        alert(data.message || 'Failed to add timesheet');
      }
    } catch (error) {
      alert('Error adding timesheet');
    }
  };

  // Update timesheet
  const updateTimesheet = async (updatedTimesheet) => {
    try {
      const { response, data } = await apiFetch(`/timesheets/${selectedTimesheet._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          date: updatedTimesheet.date,
          startTime: updatedTimesheet.startTime,
          endTime: updatedTimesheet.endTime,
          breakTime: updatedTimesheet.breakTime,
          project: updatedTimesheet.project,
          task: '',
          notes: updatedTimesheet.notes,
          location: '',
          tags: []
        })
      });
      
      if (response.ok && data.success) {
        setTimesheets(timesheets.map(ts => 
          ts._id === selectedTimesheet._id ? data.timesheet : ts
        ));
        setShowTimesheetModal(false);
        setSelectedTimesheet(null);
      } else {
        alert(data.message || 'Failed to update timesheet');
      }
    } catch (error) {
      alert('Error updating timesheet');
    }
  };

  // Add state for confirmation modal
  const [showProcessPayrollConfirm, setShowProcessPayrollConfirm] = useState(false);
  const [processPayrollError, setProcessPayrollError] = useState(null);
  const [showPayrollSuccess, setShowPayrollSuccess] = useState(false);

  // Add state for Payroll Summary breakdown modal
  const [showSummaryBreakdown, setShowSummaryBreakdown] = useState(null); // 'employees', 'gross', 'taxes', 'benefits', 'net', or null

  // Add state for export/print modals and errors
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [printError, setPrintError] = useState(null);

  // Add state for search, filter, pagination, loading, and error
  const [payrollSearch, setPayrollSearch] = useState('');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('all');
  const [payrollPage, setPayrollPage] = useState(1);
  const [payrollsPerPage] = useState(5);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [payrollError, setPayrollError] = useState(null);

  // Filter and paginate payrolls
  const filteredPayrolls = payrollHistory.filter(p =>
    (payrollStatusFilter === 'all' || p.status === payrollStatusFilter) &&
    (payrollSearch === '' || p.period.toLowerCase().includes(payrollSearch.toLowerCase()) || (p.status && p.status.toLowerCase().includes(payrollSearch.toLowerCase())))
  );
  const paginatedPayrolls = filteredPayrolls.slice((payrollPage - 1) * payrollsPerPage, payrollPage * payrollsPerPage);
  const totalPayrollPages = Math.ceil(filteredPayrolls.length / payrollsPerPage);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const showToast = (message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), 3500);
  };

  // Timesheet rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingTimesheet, setRejectingTimesheet] = useState(null);

  // Define confirmRejectTimesheet at the top level of Dashboard
  const confirmRejectTimesheet = async () => {
    if (!rejectReason.trim()) {
      showToast('Rejection reason is required.', 'error');
      return;
    }
    try {
      const { response, data } = await apiFetch(`/timesheets/${rejectingTimesheet._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason: rejectReason })
      });
      if (response.ok && data.success) {
        setTimesheets(timesheets.map(ts =>
          ts._id === rejectingTimesheet._id ? data.timesheet : ts
        ));
        setShowRejectModal(false);
        setRejectingTimesheet(null);
        showToast('Timesheet rejected.', 'success');
      } else {
        showToast(data.message || 'Failed to reject timesheet', 'error');
      }
    } catch (error) {
      showToast('Error rejecting timesheet', 'error');
    }
  };

  // Advanced analytics state
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [timesheetSummary, setTimesheetSummary] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState([]);
  const [timesheetTrends, setTimesheetTrends] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);

  // Fetch backend analytics when Reports tab is active
  React.useEffect(() => {
    if (activeTab === 'reports') {
      setReportsLoading(true);
      setReportsError(null);
      Promise.all([
        apiFetch('/reports/payroll-summary'),
        apiFetch('/reports/timesheet'),
        apiFetch('/reports/department-summary'),
        apiFetch('/reports/timesheet-trends'),
        apiFetch('/reports/top-employees')
      ]).then(([payrollRes, timesheetRes, deptRes, trendsRes, topEmpRes]) => {
        setPayrollSummary(payrollRes.data?.data || null);
        setTimesheetSummary(timesheetRes.data?.data || null);
        setDepartmentSummary(deptRes.data?.data || []);
        setTimesheetTrends(trendsRes.data?.data || []);
        setTopEmployees(topEmpRes.data?.data || []);
        setReportsLoading(false);
      }).catch(err => {
        setReportsError('Failed to load reports data');
        setReportsLoading(false);
      });
    }
  }, [activeTab]);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef();

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Add state for settings dropdown:
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsRef = useRef();

  // 2. Add click outside logic for settings dropdown:
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold text-primary-600">Cloud Payroll</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex items-center space-x-4">
                <span className="text-sm text-gray-500">Welcome,</span>
                <span className="text-sm font-medium text-gray-900">{userInfo?.name || 'User'}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userRole === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : userRole === 'manager'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {userRole === 'admin' && (
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="hidden sm:block text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin Panel
                </button>
              )}
              <button
                ref={settingsRef}
                onClick={() => setShowSettingsDropdown(v => !v)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <Settings className="w-5 h-5" />
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-gray-700">Dark Mode</span>
                      <button
                        onClick={handleToggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-1'}`}></span>
                      </button>
                    </div>
                  </div>
                )}
              </button>
              <button 
                ref={profileRef}
                onClick={() => setShowProfileDropdown((v) => !v)}
                className="p-2 text-gray-400 hover:text-gray-500 relative"
              >
                <User className="w-5 h-5" />
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => { setShowProfileCard(true); setShowProfileDropdown(false); }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileDropdown(false); logout(); navigate('/login'); }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto space-x-4 sm:space-x-8 pb-2 sm:pb-0 nav-tabs">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, roles: ['admin', 'manager', 'user'] },
              { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'manager'] },
              { id: 'timesheets', label: 'Timesheets', icon: Clock, roles: ['admin', 'manager', 'user'] },
              { id: 'payroll', label: 'Payroll', icon: DollarSign, roles: ['admin', 'manager'] },
              { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin', 'manager'] },
            ].filter(tab => tab.roles.includes(userRole)).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 responsive-padding">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 responsive-grid">
              <StatCard 
                icon={DollarSign} 
                title="Total Payroll" 
                value={`$${payrollStats.totalPayroll.toLocaleString()}`}
                change={2.5}
                color="yellow"
                onClick={() => setShowKpiModal('totalPayroll')}
              />
              <StatCard 
                icon={Users} 
                title="Active Employees" 
                value={payrollStats.activeEmployees}
                color="green"
                onClick={() => setShowKpiModal('activeEmployees')}
              />
              <StatCard 
                icon={Clock} 
                title="Pending Payments" 
                value={payrollStats.pendingPayments}
                color="red"
                onClick={() => setShowKpiModal('pendingPayments')}
              />
              <StatCard 
                icon={Calendar} 
                title="Next Payroll Date" 
                value={payrollStats.nextPayrollDate || 'N/A'}
                color="blue"
                onClick={() => setShowKpiModal('nextPayrollDate')}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Employees */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Employees</h2>
                    <button 
                      onClick={() => setActiveTab('employees')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  {employees.slice(0, 3).map((employee) => (
                    <EmployeeCard key={employee._id} employee={employee} />
                  ))}
                </div>
              </div>

              {/* Recent Payrolls */}
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
                      <div key={payroll._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 cursor-pointer" onClick={() => handleViewPayrollDetails(payroll)}>
                          <h3 className="font-medium text-gray-900">{payroll.period}</h3>
                          <p className="text-sm text-gray-500">{new Date(payroll.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">${(payroll.netAmount || 0).toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payroll.status === 'processed' ? 'bg-green-100 text-green-800' :
                            payroll.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                            payroll.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
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
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 responsive-heading">Employees</h1>
              {(userRole === 'admin' || userRole === 'manager') && (
                <button 
                  onClick={handleAddEmployee}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2 w-full sm:w-auto justify-center btn-mobile"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
                <div className="flex space-x-2 sm:space-x-4">
                  <button 
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none justify-center"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {statusFilter !== 'all' && (
                      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                        {statusFilter}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none justify-center"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto table-container custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salary
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee._id} className="hover:bg-gray-50 table-row">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-primary-600 font-medium text-sm">
                                {(employee.name || '').split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">{employee.name}</div>
                              <div className="text-sm text-gray-500 truncate">{employee.email}</div>
                              <div className="sm:hidden text-xs text-gray-400 mt-1">
                                {employee.position} • ${employee.salary.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {employee.position}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${employee.salary.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(employee.status || '').charAt(0).toUpperCase() + (employee.status || '').slice(1)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                            <button 
                              onClick={() => handleViewEmployee(employee)}
                              className="text-primary-600 hover:text-primary-900 p-1" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(userRole === 'admin' || userRole === 'manager') && (
                              <>
                                <button 
                                  onClick={() => handleEditEmployee(employee)}
                                  className="text-blue-600 hover:text-blue-900 p-1" 
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {userRole === 'admin' && (
                                  <button 
                                    onClick={() => handleDeleteEmployee(employee)}
                                    className="text-red-600 hover:text-red-900 p-1" 
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timesheets' && (
          <div className="space-y-6">
            {/* Timesheet Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Timesheet Management</h1>
                <p className="text-gray-600 mt-1">Track employee hours, manage projects, and approve timesheets</p>
              </div>
              <button 
                onClick={handleAddTimesheet}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Timesheet</span>
              </button>
            </div>

            {/* Timesheet Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Entries</p>
                    <p className="text-2xl font-bold text-gray-900">{timesheetStats.totalEntries}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{timesheetStats.totalHours.toFixed(1)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">{timesheetStats.pendingApproval}</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Hours/Day</p>
                    <p className="text-2xl font-bold text-gray-900">{timesheetStats.averageHoursPerDay}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <CalendarDays className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by employee or project..."
                      value={timesheetSearchTerm}
                      onChange={handleTimesheetSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTimesheetFilter('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timesheetFilter === 'all'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleTimesheetFilter('pending')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timesheetFilter === 'pending'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleTimesheetFilter('approved')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timesheetFilter === 'approved'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => handleTimesheetFilter('rejected')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timesheetFilter === 'rejected'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            {/* Timesheet List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Timesheet Entries</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleExportTimesheets}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={handlePrintTimesheets}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTimesheets.map((timesheet) => (
                      <tr key={timesheet._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{timesheet.employee?.name || 'Unknown Employee'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{timesheet.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {timesheet.startTime} - {timesheet.endTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            Break: {timesheet.breakTime} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{timesheet.totalHours} hrs</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{timesheet.project}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            timesheet.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : timesheet.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {timesheet.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {timesheet.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {timesheet.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                            {(timesheet.status || '').charAt(0).toUpperCase() + (timesheet.status || '').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewTimesheet(timesheet)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTimesheet(timesheet)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {timesheet.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveTimesheet(timesheet)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectTimesheet(timesheet)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteTimesheet(timesheet)}
                              className="text-red-600 hover:text-red-900"
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
                  {/* Payroll Period Selector - visually prominent with helper text */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Payroll Period</h3>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          id="biweekly"
                          name="payrollPeriod"
                          value="biweekly"
                          checked={payrollPeriod === 'biweekly'}
                          onChange={(e) => handlePayrollPeriodChange(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">Bi-weekly</span>
                        <span className="ml-1 text-xs text-gray-400">(Every 2 weeks)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          id="monthly"
                          name="payrollPeriod"
                          value="monthly"
                          checked={payrollPeriod === 'monthly'}
                          onChange={(e) => handlePayrollPeriodChange(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">Monthly</span>
                        <span className="ml-1 text-xs text-gray-400">(Once per month)</span>
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Choose how often you want to process payroll for your employees.</p>
                  </div>

                  {/* Payroll Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Payroll Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Employees:</span>
                        <button className="font-medium text-primary-600 hover:underline" onClick={() => setShowSummaryBreakdown('employees')}>
                          {payrollStats.activeEmployees}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gross Pay:</span>
                        <button className="font-medium text-primary-600 hover:underline" onClick={() => setShowSummaryBreakdown('gross')}>
                          ${payrollStats.totalPayroll.toLocaleString()}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes (Est.):</span>
                        <button className="font-medium text-primary-600 hover:underline" onClick={() => setShowSummaryBreakdown('taxes')}>
                          ${Math.round(payrollStats.totalPayroll * 0.25).toLocaleString()}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Benefits:</span>
                        <button className="font-medium text-primary-600 hover:underline" onClick={() => setShowSummaryBreakdown('benefits')}>
                          ${Math.round(payrollStats.totalPayroll * 0.15).toLocaleString()}
                        </button>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-medium">
                        <span>Net Pay:</span>
                        <button className="text-green-600 hover:underline" onClick={() => setShowSummaryBreakdown('net')}>
                          ${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => setShowProcessPayrollConfirm(true)}
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
                    onClick={() => setShowPayrollPreview(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Preview Payroll
                  </button>
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Export Report
                  </button>
                  <button 
                    onClick={() => setShowPrintModal(true)}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg font-medium text-gray-900">Recent Payroll History</h2>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                    <input
                      type="text"
                      placeholder="Search by period or status..."
                      value={payrollSearch}
                      onChange={e => setPayrollSearch(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex gap-1">
                      {['all', 'draft', 'processed', 'paid'].map(status => (
                        <button
                          key={status}
                          onClick={() => setPayrollStatusFilter(status)}
                          className={`px-2 py-1 rounded text-xs font-medium ${payrollStatusFilter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {payrollLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></div>
                    <span className="text-primary-600">Loading payrolls...</span>
                  </div>
                ) : payrollError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-700">{payrollError}</p>
                  </div>
                ) : filteredPayrolls.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No payrolls found. Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedPayrolls.map((payroll) => (
                        <div key={payroll._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1 cursor-pointer" onClick={() => handleViewPayrollDetails(payroll)}>
                            <h3 className="font-medium text-gray-900">{payroll.period}</h3>
                            <p className="text-sm text-gray-500">{new Date(payroll.createdAt).toLocaleDateString()}</p>
                            {payroll.processedBy && (
                              <p className="text-xs text-gray-400 mt-1">
                                Processed by {typeof payroll.processedBy === 'object' ? (payroll.processedBy.name || payroll.processedBy.email || payroll.processedBy._id) : payroll.processedBy}
                                {payroll.processedAt && ` on ${new Date(payroll.processedAt).toLocaleDateString()}`}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${(payroll.netAmount || 0).toLocaleString()}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              payroll.status === 'processed' ? 'bg-green-100 text-green-800' :
                              payroll.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                              payroll.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`} title={
                              payroll.status === 'draft' ? 'Payroll is in draft and not finalized.' :
                              payroll.status === 'processed' ? 'Payroll has been processed.' :
                              payroll.status === 'paid' ? 'Payroll has been paid.' :
                              'Unknown status'
                            }>
                              {payroll.status === 'draft' && <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />}
                              {payroll.status === 'processed' && <CheckCircle className="w-3 h-3 mr-1 text-green-500" />}
                              {payroll.status === 'paid' && <DollarSign className="w-3 h-3 mr-1 text-blue-500" />}
                              {payroll.status.charAt(0).toUpperCase() + payroll.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 ml-4 relative group">
                            <button 
                              onClick={() => handleViewPayrollDetails(payroll)}
                              className="text-primary-600 hover:text-primary-900 p-1 rounded-full" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadPayroll(payroll)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full" 
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <div className="relative inline-block text-left">
                              <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none" title="More actions">
                                <span className="sr-only">Open options</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5"/><circle cx="19.5" cy="12" r="1.5"/><circle cx="4.5" cy="12" r="1.5"/></svg>
                              </button>
                              {/* Dropdown menu (expand as needed) */}
                              {/* <div className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 hidden group-hover:block">
                                <div className="py-1">
                                  <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Print</button>
                                </div>
                              </div> */}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Pagination */}
                    {totalPayrollPages > 1 && (
                      <div className="flex justify-center items-center mt-6 space-x-2">
                        <button
                          onClick={() => setPayrollPage(payrollPage - 1)}
                          disabled={payrollPage === 1}
                          className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="text-sm text-gray-600">Page {payrollPage} of {totalPayrollPages}</span>
                        <button
                          onClick={() => setPayrollPage(payrollPage + 1)}
                          disabled={payrollPage === totalPayrollPages}
                          className="px-3 py-1 rounded bg-gray-100 text-gray-700 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
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
            </div>
            {reportsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading reports...</div>
            ) : reportsError ? (
              <div className="text-center py-8 text-red-500">{reportsError}</div>
            ) : (
              <>
                {/* Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Payroll Report Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Payroll Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Payroll:</span>
                        <span className="font-medium">${payrollSummary?.totalPayroll?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Pay:</span>
                        <span className="font-medium">${payrollSummary?.totalNetPay?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Taxes:</span>
                        <span className="font-medium">${payrollSummary?.totalTaxes?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Deductions:</span>
                        <span className="font-medium">${payrollSummary?.totalDeductions?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payrolls Processed:</span>
                        <span className="font-medium">{payrollSummary?.payrollCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Employees:</span>
                        <span className="font-medium">{payrollSummary?.employeeCount || 0}</span>
                      </div>
                    </div>
                  </div>
                  {/* Timesheet Report Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Timesheet Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Timesheets:</span>
                        <span className="font-medium">{timesheetSummary?.totalTimesheets || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-medium">{timesheetSummary?.totalHours?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Overtime:</span>
                        <span className="font-medium">{timesheetSummary?.totalOvertime?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Hours/Timesheet:</span>
                        <span className="font-medium">{timesheetSummary?.avgHours?.toFixed(2) || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved:</span>
                        <span className="font-medium text-green-600">{timesheetSummary?.approved || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-medium text-yellow-600">{timesheetSummary?.pending || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rejected:</span>
                        <span className="font-medium text-red-600">{timesheetSummary?.rejected || 0}</span>
                      </div>
                    </div>
                  </div>
                  {/* Department Breakdown Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Department Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      {departmentSummary.length === 0 ? (
                        <div className="text-gray-500">No data</div>
                      ) : departmentSummary.map(dept => (
                        <div key={dept.department} className="flex justify-between items-center">
                          <span className="font-medium">{dept.department}</span>
                          <span>Total Hours: {dept.totalHours?.toLocaleString() || 0}</span>
                          <span>Employees: {dept.employeeCount || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Trends Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timesheet Trends (Monthly)</h3>
                  {timesheetTrends.length === 0 ? (
                    <div className="text-gray-500">No trend data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timesheetTrends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={d => `${d.month}/${d.year}`} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="totalHours" stroke="#2563eb" name="Total Hours" />
                        <Line type="monotone" dataKey="totalOvertime" stroke="#f59e42" name="Overtime" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                {/* Top Employees Leaderboard */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Employees by Hours Worked</h3>
                  {topEmployees.length === 0 ? (
                    <div className="text-gray-500">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topEmployees} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalHours" fill="#2563eb" name="Total Hours" />
                        <Bar dataKey="totalOvertime" fill="#f59e42" name="Overtime" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </>
            )}
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

      {showProcessPayrollConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Confirm Payroll Processing</h2>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">You are about to process payroll for:</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li><strong>Period:</strong> {payrollPeriod.charAt(0).toUpperCase() + payrollPeriod.slice(1)}</li>
                <li><strong>Employees:</strong> {payrollStats.activeEmployees}</li>
                <li><strong>Gross Pay:</strong> ${payrollStats.totalPayroll.toLocaleString()}</li>
                <li><strong>Estimated Net Pay:</strong> ${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}</li>
              </ul>
              <p className="mt-3 text-xs text-yellow-600 font-medium">This action cannot be undone. Please review before confirming.</p>
            </div>
            {processingPayroll && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="text-primary-600 text-sm">Processing payroll...</span>
              </div>
            )}
            {processPayrollError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{processPayrollError}</p>
              </div>
            )}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={async () => {
                  setProcessingPayroll(true);
                  setProcessPayrollError(null);
                  try {
                    await handleProcessPayroll();
                    setShowProcessPayrollConfirm(false);
                    setShowPayrollSuccess(true);
                  } catch (err) {
                    setProcessPayrollError('An error occurred while processing payroll.');
                  } finally {
                    setProcessingPayroll(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={processingPayroll}
              >
                Yes, Process Payroll
              </button>
              <button
                onClick={() => setShowProcessPayrollConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={processingPayroll}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPayrollSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-green-700 mb-2">Payroll Processed Successfully!</h2>
            <p className="text-gray-700 mb-4">Payroll for <strong>{payrollPeriod.charAt(0).toUpperCase() + payrollPeriod.slice(1)}</strong> has been processed.</p>
            <div className="mb-4 text-sm text-gray-600">
              <div><strong>Employees:</strong> {payrollStats.activeEmployees}</div>
              <div><strong>Gross Pay:</strong> ${payrollStats.totalPayroll.toLocaleString()}</div>
              <div><strong>Net Pay:</strong> ${Math.round(payrollStats.totalPayroll * 0.6).toLocaleString()}</div>
            </div>
            <button
              onClick={() => {
                setShowPayrollSuccess(false);
                setActiveTab('payroll');
              }}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 mt-2"
            >
              View Payroll History
            </button>
          </div>
        </div>
      )}
      {showSummaryBreakdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {showSummaryBreakdown === 'employees' && 'Active Employees'}
                {showSummaryBreakdown === 'gross' && 'Gross Pay Breakdown'}
                {showSummaryBreakdown === 'taxes' && 'Estimated Taxes Breakdown'}
                {showSummaryBreakdown === 'benefits' && 'Benefits Breakdown'}
                {showSummaryBreakdown === 'net' && 'Net Pay Breakdown'}
              </h2>
              <button onClick={() => setShowSummaryBreakdown(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    {showSummaryBreakdown !== 'employees' && (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {showSummaryBreakdown === 'gross' && 'Gross Pay'}
                        {showSummaryBreakdown === 'taxes' && 'Taxes'}
                        {showSummaryBreakdown === 'benefits' && 'Benefits'}
                        {showSummaryBreakdown === 'net' && 'Net Pay'}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.filter(emp => emp.status === 'active').map(emp => {
                    const grossPay = emp.salary / 12;
                    const taxes = grossPay * 0.25;
                    const benefits = grossPay * 0.15;
                    const netPay = grossPay - taxes - benefits;
                    return (
                      <tr key={emp._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{emp.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{emp.position}</td>
                        {showSummaryBreakdown === 'employees' && null}
                        {showSummaryBreakdown === 'gross' && (
                          <td className="px-4 py-2 whitespace-nowrap">${grossPay.toLocaleString()}</td>
                        )}
                        {showSummaryBreakdown === 'taxes' && (
                          <td className="px-4 py-2 whitespace-nowrap">${taxes.toLocaleString()}</td>
                        )}
                        {showSummaryBreakdown === 'benefits' && (
                          <td className="px-4 py-2 whitespace-nowrap">${benefits.toLocaleString()}</td>
                        )}
                        {showSummaryBreakdown === 'net' && (
                          <td className="px-4 py-2 whitespace-nowrap text-green-600">${netPay.toLocaleString()}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowSummaryBreakdown(null)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Close</button>
            </div>
          </div>
        </div>
      )}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Export Payroll Report</h2>
              <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mb-4 text-gray-700">You are about to export the current payroll report. Choose your format and confirm to proceed.</p>
            {exportError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{exportError}</p>
              </div>
            )}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={async () => {
                  setExporting(true);
                  setExportError(null);
                  try {
                    handleExportPayrollReport();
                    setShowExportModal(false);
                  } catch (err) {
                    setExportError('An error occurred while exporting.');
                  } finally {
                    setExporting(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export as CSV'}
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={exporting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Print Payroll Report</h2>
              <button onClick={() => setShowPrintModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mb-4 text-gray-700">You are about to print the current payroll report. Confirm to proceed.</p>
            {printError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700">{printError}</p>
              </div>
            )}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={async () => {
                  setPrinting(true);
                  setPrintError(null);
                  try {
                    handlePrintPayroll();
                    setShowPrintModal(false);
                  } catch (err) {
                    setPrintError('An error occurred while printing.');
                  } finally {
                    setPrinting(false);
                  }
                }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={printing}
              >
                {printing ? 'Printing...' : 'Print Report'}
              </button>
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={printing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Timesheet</h2>
            <p className="mb-2 text-gray-700">Please provide a reason for rejection:</p>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-3">
              <button
                onClick={confirmRejectTimesheet}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setRejectingTimesheet(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {toast.visible && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
          role="alert">
          {toast.message}
        </div>
      )}
      {showProfileCard && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center relative">
            <button onClick={() => setShowProfileCard(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{userInfo?.name || 'User'}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
              userRole === 'admin' ? 'bg-red-100 text-red-800' :
              userRole === 'manager' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            <div className="text-sm text-gray-600 mb-2">{userInfo?.email}</div>
            <div className="text-sm text-gray-600 mb-2">{userInfo?.department}</div>
            <div className="w-full border-t border-gray-200 my-4"></div>
            <div className="w-full mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
              <p className="text-sm text-gray-700">{userInfo?.bio || 'No bio provided.'}</p>
            </div>
            <button
              onClick={() => { setShowProfileCard(false); logout(); navigate('/login'); }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold shadow mt-1"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Timesheet Modal Component
const TimesheetModal = ({ isOpen, onClose, timesheet, employees, onSubmit, mode }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    startTime: '',
    endTime: '',
    breakTime: 60,
    project: '',
    notes: ''
  });

  React.useEffect(() => {
    if (timesheet) {
      setFormData({
        employeeId: timesheet.employeeId,
        date: timesheet.date,
        startTime: timesheet.startTime,
        endTime: timesheet.endTime,
        breakTime: timesheet.breakTime,
        project: timesheet.project,
        notes: timesheet.notes
      });
    } else {
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        breakTime: 60,
        project: '',
        notes: ''
      });
    }
  }, [timesheet]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
    onSubmit({
      ...formData,
      employeeId: parseInt(formData.employeeId),
      employeeName: selectedEmployee?.name || '',
      totalHours: calculateTotalHours(formData.startTime, formData.endTime, formData.breakTime)
    });
  };

  const calculateTotalHours = (start, end, breakMinutes) => {
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const totalMinutes = (endTime - startTime) / (1000 * 60) - breakMinutes;
    return Math.max(0, totalMinutes / 60);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'add' ? 'Add Timesheet' : 'Edit Timesheet'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Employee</option>
              {employees.filter(emp => emp.status === 'active').map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Break Time (minutes)</label>
            <input
              type="number"
              value={formData.breakTime}
              onChange={(e) => setFormData({...formData, breakTime: parseInt(e.target.value)})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
              max="480"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter project name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Enter work notes..."
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Total Hours:</strong> {calculateTotalHours(formData.startTime, formData.endTime, formData.breakTime).toFixed(2)} hrs
            </p>
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
              {mode === 'add' ? 'Add Timesheet' : 'Update Timesheet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Timesheet Details Modal Component
const TimesheetDetailsModal = ({ isOpen, onClose, timesheet }) => {
  if (!isOpen || !timesheet) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Timesheet Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Employee Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold">
                {(timesheet.employeeName || '').split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{timesheet.employeeName || 'Unknown Employee'}</h3>
              <p className="text-sm text-gray-600">Employee ID: #{timesheet.employeeId}</p>
            </div>
          </div>

          {/* Timesheet Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </label>
                <p className="mt-1 text-lg text-gray-900">{timesheet.date}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Project
                </label>
                <p className="mt-1 text-lg text-gray-900">{timesheet.project}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  timesheet.status === 'approved' 
                    ? 'bg-green-100 text-green-800' 
                    : timesheet.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(timesheet.status || '').charAt(0).toUpperCase() + (timesheet.status || '').slice(1)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Work Hours
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {timesheet.startTime} - {timesheet.endTime}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Break Time
                </label>
                <p className="mt-1 text-lg text-gray-900">{timesheet.breakTime} minutes</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Hours
                </label>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {timesheet.totalHours} hrs
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {timesheet.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">
                Notes
              </label>
              <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                {timesheet.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add ProfilePage component
const ProfilePage = () => {
  const { userInfo, userRole, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{userInfo?.name || 'User'}</h2>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${
          userRole === 'admin' ? 'bg-red-100 text-red-800' :
          userRole === 'manager' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </span>
        <div className="text-sm text-gray-600 mb-2">{userInfo?.email}</div>
        <div className="text-sm text-gray-600 mb-2">{userInfo?.department}</div>
        <div className="w-full border-t border-gray-200 my-4"></div>
        <div className="w-full mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
          <p className="text-sm text-gray-700">{userInfo?.bio || 'No bio provided.'}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold shadow mt-1"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default App;
