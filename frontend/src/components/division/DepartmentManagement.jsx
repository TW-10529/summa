// components/division/DepartmentManagement.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { Users, Building2, Plus, Edit2, Trash2, Mail, Phone, Download, Filter, Search, UserPlus, UserMinus, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionManagerService } from '../../services/divisionManagerService';

const DepartmentManagement = ({ departments: propDepartments }) => {
  const { user } = useAuth();
  
  const [departments, setDepartments] = useState(propDepartments || []);
  const [departmentManagers, setDepartmentManagers] = useState([]);
  const [loading, setLoading] = useState(!propDepartments);
  const [showAddManager, setShowAddManager] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
  const [selectedDeptForDetails, setSelectedDeptForDetails] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => {
    if (!propDepartments) {
      const fetchDepartments = async () => {
        try {
          setLoading(true);
          const data = await divisionManagerService.getDepartments();
          setDepartments(data);
        } catch (error) {
          console.error('Error fetching departments:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDepartments();
    }
  }, [propDepartments]);

  useEffect(() => {
    if (departments.length > 0) {
      const mockManagers = departments.map(dept => ({
        id: dept.id,
        name: dept.manager?.name || 'Not assigned',
        email: dept.manager?.email || 'N/A',
        phone: '+1 (555) 123-4567',
        department: dept.id,
        employees: dept.employee_count || 0,
        status: dept.manager_id ? 'active' : 'inactive'
      }));
      setDepartmentManagers(mockManagers.filter(m => m.name !== 'Not assigned'));
    }
  }, [departments]);

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const handleAssignManager = (deptId) => {
    setSelectedDepartment(deptId);
    setShowAddManager(true);
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name || !newDepartment.code) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const newDept = {
        id: departments.length + 1,
        ...newDepartment,
        division_id: user.division_id || 1,
        manager_id: null,
        created_at: new Date().toISOString(),
        manager: null,
        employee_count: 0
      };

      setDepartments([...departments, newDept]);
      setNewDepartment({ name: '', code: '', description: '' });
      setShowAddDepartment(false);
      
      alert('✅ Department added successfully!');
    } catch (error) {
      console.error('Error adding department:', error);
      alert('Failed to add department. Please try again.');
    }
  };

  const handleDeleteDepartment = (deptId) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    setDepartments(departments.filter(dept => dept.id !== deptId));
    alert('✅ Department deleted successfully!');
  };

  const handleRemoveManager = (managerId) => {
    if (!confirm('Remove this manager from the department?')) {
      return;
    }

    setDepartments(departments.map(dept => 
      dept.id === managerId 
        ? { ...dept, manager_id: null, manager: null }
        : dept
    ));

    setDepartmentManagers(departmentManagers.filter(m => m.id !== managerId));
    
    alert('✅ Manager removed successfully!');
  };

  const handleViewDepartmentDetails = (dept) => {
    setSelectedDeptForDetails(dept);
    setShowDepartmentDetails(true);
  };

  const handleExportDepartments = () => {
    const dataStr = JSON.stringify(departments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `departments_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Departments data exported successfully!');
  };

  const handleBulkAction = (action) => {
    if (selectedManagers.length === 0) {
      alert('Please select at least one manager');
      return;
    }

    if (action === 'contact') {
      alert(`Contacting ${selectedManagers.length} managers...`);
    } else if (action === 'remove') {
      if (confirm(`Remove ${selectedManagers.length} selected managers?`)) {
        setDepartmentManagers(departmentManagers.filter(m => !selectedManagers.includes(m.id)));
        setSelectedManagers([]);
        alert(`${selectedManagers.length} managers removed successfully!`);
      }
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredManagers = departmentManagers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDepartmentName(manager.department).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Department Management</h3>
          <p className="text-gray-600">Manage departments and department managers in your division</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportDepartments}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowAddDepartment(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search departments or managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select className="input-field">
              <option value="all">All Departments</option>
              <option value="with_manager">With Manager</option>
              <option value="without_manager">Without Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => {
          const manager = departmentManagers.find(m => m.department === dept.id);
          
          return (
            <div key={dept.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-800">{dept.name}</h4>
                  <p className="text-gray-600 text-sm">{dept.code}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAssignManager(dept.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Assign Manager"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDeleteDepartment(dept.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Manager Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Department Manager</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      dept.manager_id 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dept.manager_id ? 'Assigned' : 'Not assigned'}
                    </span>
                  </div>
                  {dept.manager ? (
                    <div>
                      <p className="font-medium text-gray-800">{dept.manager.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{dept.manager.email}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No manager assigned</p>
                  )}
                </div>
                
                {/* Department Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Employees</span>
                    <span className="font-medium">{dept.employee_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shift Coverage</span>
                    <span className="font-medium text-green-600">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Today</span>
                    <span className="font-medium">{Math.floor((dept.employee_count || 0) * 0.92)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleViewDepartmentDetails(dept)}
                  className="w-full btn-secondary text-sm flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Department Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Managers Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-800">Department Managers</h4>
              <p className="text-gray-600 text-sm">{departmentManagers.length} managers assigned</p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedManagers.length > 0 && (
                <>
                  <button
                    onClick={() => handleBulkAction('contact')}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Contact ({selectedManagers.length})</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('remove')}
                    className="btn-secondary bg-red-50 text-red-600 hover:bg-red-100 flex items-center space-x-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Remove ({selectedManagers.length})</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedManagers(departmentManagers.map(m => m.id));
                      } else {
                        setSelectedManagers([]);
                      }
                    }}
                    checked={selectedManagers.length === departmentManagers.length && departmentManagers.length > 0}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredManagers.map((manager) => (
                <tr key={manager.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedManagers.includes(manager.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedManagers([...selectedManagers, manager.id]);
                        } else {
                          setSelectedManagers(selectedManagers.filter(id => id !== manager.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${manager.name}`}
                        alt=""
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{getDepartmentName(manager.department)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{manager.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{manager.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{manager.employees}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          alert(`Contacting ${manager.name}...`);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Contact
                      </button>
                      <button 
                        onClick={() => handleRemoveManager(manager.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Details Modal */}
      {showDepartmentDetails && selectedDeptForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{selectedDeptForDetails.name} Details</h4>
                <p className="text-gray-600">Department code: {selectedDeptForDetails.code}</p>
              </div>
              <button
                onClick={() => {
                  setShowDepartmentDetails(false);
                  setSelectedDeptForDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Basic Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Department Name</label>
                    <p className="font-medium">{selectedDeptForDetails.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Department Code</label>
                    <p className="font-medium">{selectedDeptForDetails.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Total Employees</label>
                    <p className="font-medium">{selectedDeptForDetails.employee_count || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Created Date</label>
                    <p className="font-medium">
                      {new Date(selectedDeptForDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedDeptForDetails.description && (
                  <div className="mt-4">
                    <label className="block text-sm text-gray-600">Description</label>
                    <p className="font-medium mt-1">{selectedDeptForDetails.description}</p>
                  </div>
                )}
              </div>

              {/* Manager Information */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Manager Information</h5>
                {selectedDeptForDetails.manager ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        className="h-12 w-12 rounded-full"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDeptForDetails.manager.name}`}
                        alt=""
                      />
                      <div>
                        <p className="font-medium text-gray-800">{selectedDeptForDetails.manager.name}</p>
                        <p className="text-sm text-gray-600">{selectedDeptForDetails.manager.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Employee ID: {selectedDeptForDetails.manager.employee_id}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">No manager assigned</p>
                    <button 
                      onClick={() => {
                        setShowDepartmentDetails(false);
                        setSelectedDeptForDetails(null);
                        handleAssignManager(selectedDeptForDetails.id);
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Assign a manager
                    </button>
                  </div>
                )}
              </div>

              {/* Department Statistics */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Department Statistics</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-800">92%</div>
                    <div className="text-xs text-gray-600">Attendance Rate</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-800">88%</div>
                    <div className="text-xs text-gray-600">Productivity</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-800">12</div>
                    <div className="text-xs text-gray-600">Avg Hours/Week</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <div className="text-lg font-bold text-gray-800">4.2</div>
                    <div className="text-xs text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h5 className="font-medium text-gray-800 mb-3">Recent Activity</h5>
                <div className="space-y-2">
                  {[
                    { action: 'Shift schedule updated', time: '2 hours ago' },
                    { action: 'New employee onboarded', time: '1 day ago' },
                    { action: 'Monthly report generated', time: '2 days ago' },
                    { action: 'Equipment maintenance completed', time: '3 days ago' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{activity.action}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowDepartmentDetails(false);
                    setSelectedDeptForDetails(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDepartmentDetails(false);
                    setSelectedDeptForDetails(null);
                    handleAssignManager(selectedDeptForDetails.id);
                  }}
                  className="flex-1 btn-primary"
                >
                  Manage Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-lg font-semibold text-gray-800">Add New Department</h4>
              <button
                onClick={() => setShowAddDepartment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  placeholder="e.g., Production Line C"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  value={newDepartment.code}
                  onChange={(e) => setNewDepartment({...newDepartment, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., PROD_C"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Brief description of the department..."
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddDepartment(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  className="flex-1 btn-primary"
                >
                  Create Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Manager Modal */}
      {showAddManager && selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-lg font-semibold text-gray-800">
                Assign Department Manager
              </h4>
              <button
                onClick={() => {
                  setShowAddManager(false);
                  setSelectedDepartment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{getDepartmentName(selectedDepartment)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Manager *</label>
                <select className="input-field" required>
                  <option value="">Select Employee</option>
                  <option value="john_doe">John Doe - Senior Operator</option>
                  <option value="jane_smith">Jane Smith - Supervisor</option>
                  <option value="robert_chen">Robert Chen - Lead Technician</option>
                  <option value="maria_garcia">Maria Garcia - Quality Inspector</option>
                  <option value="david_wilson">David Wilson - Maintenance Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input 
                  type="date" 
                  className="input-field" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  placeholder="Any special instructions or notes..."
                  rows="2"
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddManager(false);
                    setSelectedDepartment(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 btn-primary"
                  onClick={() => {
                    const select = document.querySelector('select');
                    const selectedManager = select.options[select.selectedIndex].text;
                    
                    const dept = departments.find(d => d.id === selectedDepartment);
                    if (dept) {
                      const updatedDept = {
                        ...dept,
                        manager_id: Date.now(),
                        manager: {
                          id: Date.now(),
                          name: selectedManager.split(' - ')[0],
                          email: `${selectedManager.split(' - ')[0].toLowerCase().replace(' ', '.')}@factory.com`,
                          employee_id: `EMP${Date.now().toString().slice(-4)}`
                        }
                      };
                      
                      setDepartments(departments.map(d => 
                        d.id === selectedDepartment ? updatedDept : d
                      ));
                      
                      setDepartmentManagers([
                        ...departmentManagers,
                        {
                          id: selectedDepartment,
                          name: updatedDept.manager.name,
                          email: updatedDept.manager.email,
                          phone: '+1 (555) 123-4567',
                          department: selectedDepartment,
                          employees: dept.employee_count || 0,
                          status: 'active'
                        }
                      ]);
                    }
                    
                    setShowAddManager(false);
                    setSelectedDepartment(null);
                    alert('✅ Manager assigned successfully!');
                  }}
                >
                  Assign Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;