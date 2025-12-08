import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, UserPlus, Edit2, Trash2, Download, Eye, 
  Building2, Loader2, AlertCircle, CheckCircle, XCircle,
  Mail, Phone, MapPin, Calendar
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
  const [showDetails, setShowDetails] = useState(null);

  // Event listener for quick actions from AdminDashboard
  useEffect(() => {
    const handleOpenAddEmployeeModal = () => {
      setSelectedEmployee(null);
      setShowModal(true);
      setMessage({ type: 'success', text: 'Ready to add new employee!' });
    };

    window.addEventListener('openAddEmployeeModal', handleOpenAddEmployeeModal);

    return () => {
      window.removeEventListener('openAddEmployeeModal', handleOpenAddEmployeeModal);
    };
  }, []);

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
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.username?.toLowerCase().includes(search.toLowerCase());
    
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

  const getRoleColor = (role) => {
    const colorMap = {
      'admin': 'purple',
      'division_manager': 'blue',
      'department_manager': 'green',
      'employee': 'gray'
    };
    return colorMap[role] || 'gray';
  };

  const getDivisionName = (divisionId) => {
    if (!divisionId) return 'Not Assigned';
    const division = divisions.find(d => d.id === divisionId);
    return division?.name || `Division ${divisionId}`;
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return 'Not Assigned';
    const department = departments.find(d => d.id === departmentId);
    return department?.name || `Department ${departmentId}`;
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleViewDetails = (employeeId) => {
    setShowDetails(showDetails === employeeId ? null : employeeId);
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
      setShowModal(false);
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  };

  const handleDelete = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
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

  const handleExport = () => {
    try {
      const exportData = filteredEmployees.map(emp => ({
        id: emp.id,
        employee_id: emp.employee_id,
        full_name: emp.full_name,
        email: emp.email,
        username: emp.username,
        role: getRoleDisplay(emp.role),
        division: getDivisionName(emp.division_id),
        department: getDepartmentName(emp.department_id),
        status: emp.is_active ? 'Active' : 'Inactive',
        created_at: new Date(emp.created_at).toLocaleDateString()
      }));
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('Employee data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  // Show success message for 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
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
        <div className="card p-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <span className="text-gray-600">Loading employees...</span>
          <p className="text-sm text-gray-500 mt-2">Fetching data from server</p>
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
          <div className="mt-1 text-sm text-gray-500">
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
            disabled={filteredEmployees.length === 0}
          >
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
        <div className="card p-4 bg-green-50 border border-green-200 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <span className="text-red-700 font-medium">Error:</span>
              <span className="text-red-700 ml-2">{error}</span>
            </div>
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
                placeholder="Search by name, ID, email..."
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
                <React.Fragment key={employee.id}>
                  <tr className="hover:bg-gray-50">
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
                      <span className={`px-2 py-1 text-xs rounded-full bg-${getRoleColor(employee.role)}-100 text-${getRoleColor(employee.role)}-800`}>
                        {getRoleDisplay(employee.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(employee.is_active)}`}>
                        {employee.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        onClick={() => handleEditEmployee(employee)}
                        title="Edit Employee"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button 
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                        onClick={() => handleViewDetails(employee.id)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {employee.is_active ? (
                        <button 
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                          onClick={() => handleActivate(employee.id, false)}
                          title="Deactivate"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          onClick={() => handleActivate(employee.id, true)}
                          title="Activate"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      
                      {currentUser?.role === 'admin' && employee.id !== currentUser.id && (
                        <button 
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          onClick={() => handleDelete(employee.id, employee.full_name)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {showDetails === employee.id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Contact Information</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{employee.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Joined: {new Date(employee.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Assignment</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Division: {getDivisionName(employee.division_id)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Department: {getDepartmentName(employee.department_id)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Account Status</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className={`w-4 h-4 ${employee.is_active ? 'text-green-500' : 'text-red-500'}`} />
                                <span className="text-sm text-gray-600">
                                  Status: {employee.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Last Updated: {employee.updated_at ? new Date(employee.updated_at).toLocaleDateString() : 'Never'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          
          {filteredEmployees.length === 0 && !loading && (
            <div className="p-8 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">No Employees Found</h4>
              <p className="text-gray-600 mb-6">
                {search || selectedDivision !== 'all' || selectedDepartment !== 'all' || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? 'No employees match your filters. Try adjusting your search criteria.'
                  : 'Your database doesn\'t have any employees yet. Add your first employee to get started.'}
              </p>
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={handleAddEmployee}
                  className="btn-primary flex items-center justify-center space-x-2 mx-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Your First Employee</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Pagination (optional) */}
        {filteredEmployees.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEmployees.length}</span> of{' '}
                <span className="font-medium">{filteredEmployees.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
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

// CSS for fade-in animation
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default EmployeeDatabase;