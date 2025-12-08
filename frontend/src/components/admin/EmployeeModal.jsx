import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Briefcase, Shield, Clock } from 'lucide-react';
import { divisionService, departmentService } from '../../services/api';

const EmployeeModal = ({ isOpen, onClose, employee = null, onSave }) => {
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([
    { id: 1, name: 'Morning', start_time: '08:00', end_time: '16:00', description: 'Morning shift (8AM - 4PM)' },
    { id: 2, name: 'Afternoon', start_time: '16:00', end_time: '00:00', description: 'Afternoon shift (4PM - 12AM)' },
    { id: 3, name: 'Night', start_time: '00:00', end_time: '08:00', description: 'Night shift (12AM - 8AM)' }
  ]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    employee_id: '',
    role: 'employee',
    division_id: '',
    department_id: '',
    shift_id: '', // New field for shift
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
      if (employee) {
        console.log('📝 Editing employee:', employee);
        setFormData({
          email: employee.email || '',
          username: employee.username || '',
          full_name: employee.full_name || '',
          password: '', // Don't pre-fill password for edits
          employee_id: employee.employee_id || '',
          role: employee.role || 'employee',
          division_id: employee.division_id || '',
          department_id: employee.department_id || '',
          shift_id: employee.shift_id || '', // Initialize shift from employee data
        });
        
        if (employee.division_id) {
          fetchDepartments(employee.division_id);
        }
      } else {
        // Reset form for new employee
        setFormData({
          email: '',
          username: '',
          full_name: '',
          password: '',
          employee_id: '',
          role: 'employee',
          division_id: '',
          department_id: '',
          shift_id: '', // Reset shift
        });
      }
      setErrors({});
    }
  }, [isOpen, employee]);

  const fetchDivisions = async () => {
    try {
      const data = await divisionService.getDivisions();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchDepartments = async (divisionId) => {
    try {
      const data = await departmentService.getDepartments(divisionId);
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'division_id') {
      setFormData({
        ...formData,
        [name]: value,
        department_id: '', // Reset department when division changes
      });
      
      if (value) {
        fetchDepartments(value);
      } else {
        setDepartments([]);
      }
    } else if (name === 'role') {
      // When role changes to division_manager or admin, clear department
      const newFormData = {
        ...formData,
        [name]: value,
      };
      
      // If role is division_manager or admin, clear department_id
      if (value === 'division_manager' || value === 'admin') {
        newFormData.department_id = '';
      }
      
      setFormData(newFormData);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!employee && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!employee && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Shift validation for employees (optional but recommended)
    if (formData.role === 'employee' && !formData.shift_id) {
      newErrors.shift_id = 'Shift assignment is recommended for employees';
    }
    
    // Role-specific validations
    if (formData.role === 'division_manager') {
      if (!formData.division_id) {
        newErrors.division_id = 'Division is required for division manager';
      }
    } else if (formData.role === 'department_manager') {
      if (!formData.division_id) {
        newErrors.division_id = 'Division is required for department manager';
      }
      if (!formData.department_id) {
        newErrors.department_id = 'Department is required for department manager';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data to send - IMPORTANT: Convert to proper format
      const dataToSend = { ...formData };
      
      // Don't send password if it's empty (for updates)
      if (employee && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      // Convert empty strings to null for database
      if (dataToSend.employee_id === '') {
        dataToSend.employee_id = null;
      }
      
      if (dataToSend.division_id === '') {
        dataToSend.division_id = null;
      } else {
        dataToSend.division_id = parseInt(dataToSend.division_id);
      }
      
      if (dataToSend.department_id === '') {
        dataToSend.department_id = null;
      } else if (dataToSend.department_id) {
        dataToSend.department_id = parseInt(dataToSend.department_id);
      }
      
      // Handle shift_id
      if (dataToSend.shift_id === '') {
        dataToSend.shift_id = null;
      } else if (dataToSend.shift_id) {
        dataToSend.shift_id = parseInt(dataToSend.shift_id);
      }
      
      // IMPORTANT: For division_manager or admin, explicitly set department_id to null
      if (dataToSend.role === 'division_manager' || dataToSend.role === 'admin') {
        dataToSend.department_id = null;
      }
      
      console.log('📤 Sending update data:', dataToSend);
      console.log('📊 Current employee:', employee);
      
      // Send to parent component
      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('❌ Error saving employee:', error);
      
      // Handle specific API errors
      if (error.response?.data?.detail) {
        const errorDetail = error.response.data.detail;
        if (errorDetail.includes('Email already')) {
          setErrors(prev => ({ ...prev, email: errorDetail }));
        } else if (errorDetail.includes('Username already')) {
          setErrors(prev => ({ ...prev, username: errorDetail }));
        } else {
          alert(`Error: ${errorDetail}`);
        }
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to save employee. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'division_manager', label: 'Division Manager' },
    { value: 'department_manager', label: 'Department Manager' },
    { value: 'employee', label: 'Employee' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-semibold text-gray-800">
              {employee ? `Edit Employee: ${employee.full_name}` : 'Add New Employee'}
            </h4>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-700 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Personal Information</span>
              </h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`input-field ${errors.full_name ? 'border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    required
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                  required
                  disabled={loading}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Optional"
                  disabled={loading}
                />
              </div>

              {!employee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.password ? 'border-red-500' : ''}`}
                      required={!employee}
                      minLength="6"
                      disabled={loading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              )}
            </div>

            {/* Role & Assignment */}
            <div className="space-y-3">
              <h5 className="font-medium text-gray-700 flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Role & Assignment</span>
              </h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.role === 'division_manager' && 'Division managers manage entire divisions'}
                  {formData.role === 'department_manager' && 'Department managers manage specific departments'}
                  {formData.role === 'admin' && 'Admins have full system access'}
                  {formData.role === 'employee' && 'Employees have basic access'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                  {(formData.role === 'division_manager' || formData.role === 'department_manager') && ' *'}
                </label>
                <select
                  name="division_id"
                  value={formData.division_id}
                  onChange={handleChange}
                  className={`input-field ${errors.division_id ? 'border-red-500' : ''}`}
                  disabled={loading || divisions.length === 0}
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
                {errors.division_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.division_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                  {formData.role === 'department_manager' && ' *'}
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={`input-field ${errors.department_id ? 'border-red-500' : ''}`}
                  disabled={
                    !formData.division_id || 
                    departments.length === 0 || 
                    loading ||
                    formData.role === 'division_manager' ||
                    formData.role === 'admin'
                  }
                >
                  <option value="">
                    {!formData.division_id 
                      ? 'Select Division First' 
                      : departments.length === 0 
                        ? 'No Departments Available' 
                        : formData.role === 'division_manager' || formData.role === 'admin'
                          ? 'Not applicable for this role'
                          : 'Select Department'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.department_id}</p>
                )}
                {(formData.role === 'division_manager' || formData.role === 'admin') && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === 'division_manager' 
                      ? 'Division managers are assigned to divisions, not departments'
                      : 'Admins are not assigned to specific departments'}
                  </p>
                )}
              </div>

              {/* Shift Assignment - Only for employees and department managers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Assignment
                  {formData.role === 'employee' && ' (Recommended)'}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                  <select
                    name="shift_id"
                    value={formData.shift_id}
                    onChange={handleChange}
                    className={`input-field pl-10 ${errors.shift_id ? 'border-red-500' : ''}`}
                    disabled={loading || formData.role === 'admin' || formData.role === 'division_manager'}
                  >
                    <option value="">Select Shift (Optional)</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.start_time} - {shift.end_time})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.shift_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.shift_id}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.shift_id ? 
                    (() => {
                      const selectedShift = shifts.find(s => s.id === parseInt(formData.shift_id));
                      return selectedShift ? selectedShift.description : '';
                    })() 
                    : 'Assign a work shift to this employee'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : employee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;