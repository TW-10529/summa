import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, UserPlus, Edit2, Trash2, Download, Eye, 
  Building2, Loader2, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { userService, divisionService, departmentService } from '../../services/api';
import EmployeeModal from './EmployeeModal';

const EmployeeDatabase = () => {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees
  useEffect(() => {
    fetchEmployees();
  }, [selectedDivision, selectedDepartment, selectedRole, selectedStatus, search]);

  // Fetch divisions and departments
  useEffect(() => {
    fetchDivisions();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        division_id: selectedDivision !== 'all' ? parseInt(selectedDivision) : undefined,
        department_id: selectedDepartment !== 'all' ? parseInt(selectedDepartment) : undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        search: search || undefined,
      };
      
      const data = await userService.getUsers(params);
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const data = await divisionService.getDivisions();
      setDivisions(data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const divisionId = selectedDivision !== 'all' ? parseInt(selectedDivision) : undefined;
      const data = await departmentService.getDepartments(divisionId);
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Get departments for selected division
  const getFilteredDepartments = () => {
    if (selectedDivision === 'all') return departments;
    return departments.filter(dept => dept.division_id === parseInt(selectedDivision));
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesDivision = selectedDivision === 'all' || emp.division_id === parseInt(selectedDivision);
    const matchesDepartment = selectedDepartment === 'all' || emp.department_id === parseInt(selectedDepartment);
    const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && emp.is_active) ||
      (selectedStatus === 'inactive' && !emp.is_active);
    
    return matchesSearch && matchesDivision && matchesDepartment && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case true:
      case 'active': 
        return 'bg-green-100 text-green-800';
      case false:
      case 'inactive': 
        return 'bg-red-100 text-red-800';
      case 'on-leave': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'Admin',
      'division_manager': 'Division Manager',
      'department_manager': 'Department Manager',
      'employee': 'Employee',
    };
    return roleMap[role] || role;
  };

  const getDivisionName = (divisionId) => {
    if (!divisionId) return 'None';
    const division = divisions.find(d => d.id === divisionId);
    return division?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'None';
    const department = departments.find(d => d.id === departmentId);
    return department?.name || 'Unknown';
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (selectedEmployee) {
        // Update existing employee
        await userService.updateUser(selectedEmployee.id, employeeData);
        setSuccess('Employee updated successfully!');
      } else {
        // Create new employee
        await userService.createUser(employeeData);
        setSuccess('Employee added successfully!');
      }
      
      // Refresh employee list
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      return;
    }
    
    try {
      await userService.deleteUser(employeeId);
      setSuccess('Employee deleted successfully!');
      fetchEmployees(); // Refresh list
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error.response?.data?.detail || 'Failed to delete employee');
    }
  };

  const handleActivate = async (employeeId, activate = true) => {
    try {
      await userService.updateUser(employeeId, { is_active: activate });
      setSuccess(`Employee ${activate ? 'activated' : 'deactivated'} successfully!`);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('Failed to update employee status');
    }
  };

  // Show success message for 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (loading && employees.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Employee Database</h3>
            <p className="text-gray-600">Manage employees across divisions and departments</p>
          </div>
        </div>
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading employees...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Employee Database</h3>
          <p className="text-gray-600">Manage employees across divisions and departments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          {currentUser?.role === 'admin' && (
            <button 
              onClick={handleAddEmployee}
              className="btn-primary flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="card p-4 bg-green-50 border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
            <select
              value={selectedDivision}
              onChange={(e) => {
                setSelectedDivision(e.target.value);
                setSelectedDepartment('all'); // Reset department when division changes
              }}
              className="input-field"
              disabled={loading || divisions.length === 0}
            >
              <option value="all">All Divisions</option>
              {divisions.map(division => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
              disabled={selectedDivision === 'all' || loading}
            >
              <option value="all">
                {selectedDivision === 'all' ? 'Select Division First' : 'All Departments'}
              </option>
              {getFilteredDepartments().map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field"
              disabled={loading}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        {/* Role Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                selectedRole === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Roles
            </button>
            {['admin', 'division_manager', 'department_manager', 'employee'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getRoleDisplay(role)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700">{error}</span>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={employee.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.full_name}`}
                          alt={employee.full_name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.full_name}</div>
                        <div className="text-sm text-gray-500">{employee.employee_id || 'No ID'}</div>
                        <div className="text-xs text-gray-400">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="text-sm text-gray-900">
                        {getDivisionName(employee.division_id)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {getDepartmentName(employee.department_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 capitalize">
                      {getRoleDisplay(employee.role)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.is_active)}`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit2 className="w-4 h-4 inline" />
                    </button>
                    
                    {employee.is_active ? (
                      <button 
                        className="text-yellow-600 hover:text-yellow-900"
                        onClick={() => handleActivate(employee.id, false)}
                        title="Deactivate"
                      >
                        <XCircle className="w-4 h-4 inline" />
                      </button>
                    ) : (
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => handleActivate(employee.id, true)}
                        title="Activate"
                      >
                        <CheckCircle className="w-4 h-4 inline" />
                      </button>
                    )}
                    
                    {currentUser?.role === 'admin' && employee.id !== currentUser.id && (
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(employee.id, employee.full_name)}
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEmployees.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              {search || selectedDivision !== 'all' || selectedDepartment !== 'all' || selectedRole !== 'all' || selectedStatus !== 'all'
                ? 'No employees match your filters. Try adjusting your search criteria.'
                : 'No employees found. Click "Add Employee" to create one.'}
            </div>
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />
    </div>
  );
};

export default EmployeeDatabase;