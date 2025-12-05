import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Briefcase, Shield } from 'lucide-react';
import { divisionService, departmentService } from '../../services/api';

const EmployeeModal = ({ isOpen, onClose, employee = null, onSave }) => {
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
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
  });

  useEffect(() => {
    if (isOpen) {
      fetchDivisions();
      if (employee) {
        setFormData({
          email: employee.email || '',
          username: employee.username || '',
          full_name: employee.full_name || '',
          password: '', // Don't pre-fill password for edits
          employee_id: employee.employee_id || '',
          role: employee.role || 'employee',
          division_id: employee.division_id || '',
          department_id: employee.department_id || '',
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
        });
      }
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
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(error.response?.data?.detail || 'Failed to save employee');
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
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h4>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
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
                  className="input-field"
                  required
                />
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
                    className="input-field pl-10"
                    required
                  />
                </div>
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
                  className="input-field"
                  required
                />
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
                      className="input-field pl-10"
                      required={!employee}
                      minLength="6"
                    />
                  </div>
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
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <select
                  name="division_id"
                  value={formData.division_id}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="input-field"
                  disabled={!formData.division_id || departments.length === 0}
                >
                  <option value="">
                    {!formData.division_id 
                      ? 'Select Division First' 
                      : departments.length === 0 
                        ? 'No Departments Available' 
                        : 'Select Department'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
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
                {loading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;