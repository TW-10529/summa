import React, { useState, useEffect } from 'react';
import { Building2, Users, Plus, Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle, UserCheck, X } from 'lucide-react';
import { divisionService, departmentService, userService } from '../../services/api';

const Divisions = () => {
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedDivision, setExpandedDivision] = useState(null);
  const [showAddDivision, setShowAddDivision] = useState(false);
  const [showEditDivision, setShowEditDivision] = useState(null);
  const [showAddDepartment, setShowAddDepartment] = useState(null);
  const [showEditDepartment, setShowEditDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  
  const [newDivision, setNewDivision] = useState({
    name: '',
    description: '',
    color: 'blue'
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    description: '',
    division_id: '',
    manager_id: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchDivisions(), fetchAllUsers()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const data = await divisionService.getDivisions();
      setDivisions(data);
      
      const deptsByDivision = {};
      for (const division of data) {
        try {
          const departmentsData = await departmentService.getDepartments(division.id);
          deptsByDivision[division.id] = departmentsData;
        } catch (err) {
          console.error(`Error fetching departments:`, err);
          deptsByDivision[division.id] = [];
        }
      }
      setDepartments(deptsByDivision);
    } catch (error) {
      console.error('Error fetching divisions:', error);
      throw error;
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await userService.getUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  const toggleDivision = (divisionId) => {
    setExpandedDivision(expandedDivision === divisionId ? null : divisionId);
  };

  // Division CRUD Operations
  const handleAddDivision = async () => {
    try {
      await divisionService.createDivision(newDivision);
      setSuccess('Division created successfully!');
      setShowAddDivision(false);
      setNewDivision({ name: '', description: '', color: 'blue' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating division:', error);
      setError(error.response?.data?.detail || 'Failed to create division');
    }
  };

  const handleEditDivision = async () => {
    try {
      await divisionService.updateDivision(showEditDivision.id, {
        name: newDivision.name,
        description: newDivision.description,
        color: newDivision.color
      });
      setSuccess('Division updated successfully!');
      setShowEditDivision(null);
      setNewDivision({ name: '', description: '', color: 'blue' });
      fetchAllData();
    } catch (error) {
      console.error('Error updating division:', error);
      setError(error.response?.data?.detail || 'Failed to update division');
    }
  };

  const handleDeleteDivision = async (divisionId, divisionName) => {
    if (!window.confirm(`Are you sure you want to delete division "${divisionName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await divisionService.deleteDivision(divisionId);
      setSuccess(`Division "${divisionName}" deleted successfully!`);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting division:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to delete division';
      setError(errorMsg);
    }
  };

  // Department CRUD Operations
  const handleAddDepartment = async () => {
    try {
      const departmentData = {
        name: newDepartment.name,
        code: newDepartment.code,
        description: newDepartment.description,
        division_id: parseInt(newDepartment.division_id),
        manager_id: newDepartment.manager_id ? parseInt(newDepartment.manager_id) : null
      };
      
      await departmentService.createDepartment(departmentData);
      setSuccess('Department created successfully!');
      setShowAddDepartment(null);
      setNewDepartment({ name: '', code: '', description: '', division_id: '', manager_id: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error creating department:', error);
      setError(error.response?.data?.detail || 'Failed to create department');
    }
  };

  const handleEditDepartment = async () => {
    try {
      const departmentData = {
        name: newDepartment.name,
        code: newDepartment.code,
        description: newDepartment.description,
        division_id: parseInt(newDepartment.division_id),
        manager_id: newDepartment.manager_id ? parseInt(newDepartment.manager_id) : null
      };
      
      await departmentService.updateDepartment(showEditDepartment.id, departmentData);
      setSuccess('Department updated successfully!');
      setShowEditDepartment(null);
      setNewDepartment({ name: '', code: '', description: '', division_id: '', manager_id: '' });
      fetchAllData();
    } catch (error) {
      console.error('Error updating department:', error);
      setError(error.response?.data?.detail || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (!window.confirm(`Are you sure you want to delete department "${departmentName}"?`)) {
      return;
    }
    
    try {
      await departmentService.deleteDepartment(departmentId);
      setSuccess(`Department "${departmentName}" deleted successfully!`);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting department:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to delete department';
      setError(errorMsg);
    }
  };

  // Helper functions
  const getManagerName = (managerId) => {
    if (!managerId) return 'Not assigned';
    const manager = allUsers.find(user => user.id === managerId);
    return manager ? `${manager.full_name} (${manager.employee_id || 'No ID'})` : `ID: ${managerId}`;
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const colorClasses = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Divisions & Departments</h3>
            <p className="text-gray-600">Manage factory divisions and their departments</p>
          </div>
        </div>
        <div className="card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading divisions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Divisions & Departments</h3>
          <p className="text-gray-600">Manage factory divisions and their departments</p>
        </div>
        <button 
          onClick={() => {
            setShowAddDivision(true);
            setNewDivision({ name: '', description: '', color: 'blue' });
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Division</span>
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="card p-4 bg-green-50 border border-green-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="card p-4 bg-red-50 border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Division Cards */}
      <div className="space-y-4">
        {divisions.length === 0 ? (
          <div className="card p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Divisions Found</h4>
            <p className="text-gray-600">Create your first division to get started</p>
            <button 
              onClick={() => setShowAddDivision(true)}
              className="btn-primary mt-4"
            >
              Create First Division
            </button>
          </div>
        ) : (
          divisions.map((division) => {
            const divisionDepts = departments[division.id] || [];
            const isExpanded = expandedDivision === division.id;
            const colorClass = colorClasses[division.color] || colorClasses.blue;
            
            return (
              <div key={division.id} className="card overflow-hidden">
                {/* Division Header */}
                <div 
                  className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleDivision(division.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${colorClass.bg} ${colorClass.border} border`}>
                        <Building2 className={`w-6 h-6 ${colorClass.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800">{division.name}</h4>
                          <div className="text-sm text-gray-500">
                            ID: {division.id}
                          </div>
                        </div>
                        
                        {division.description && (
                          <p className="text-sm text-gray-600 mt-2">{division.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {divisionDepts.length} Department{divisionDepts.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditDivision(division);
                          setNewDivision({
                            name: division.name,
                            description: division.description || '',
                            color: division.color
                          });
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Edit Division"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAddDepartment(division.id);
                          setNewDepartment({
                            name: '',
                            code: '',
                            description: '',
                            division_id: division.id,
                            manager_id: ''
                          });
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                        title="Add Department"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDivision(division.id, division.name);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        title="Delete Division"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Departments List (Expanded) */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-semibold text-gray-700">Departments in this Division</h5>
                      <button 
                        onClick={() => {
                          setShowAddDepartment(division.id);
                          setNewDepartment({
                            name: '',
                            code: '',
                            description: '',
                            division_id: division.id,
                            manager_id: ''
                          });
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Department</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {divisionDepts.length === 0 ? (
                        <div className="col-span-full p-4 text-center text-gray-500">
                          No departments in this division yet
                        </div>
                      ) : (
                        divisionDepts.map((dept) => (
                          <div key={dept.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-800">{dept.name}</h6>
                                <p className="text-sm text-gray-500 mt-1">Code: {dept.code}</p>
                                {dept.description && (
                                  <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
                                )}
                              </div>
                              <div className="flex space-x-1 ml-2">
                                <button 
                                  onClick={() => {
                                    setShowEditDepartment(dept);
                                    setNewDepartment({
                                      name: dept.name,
                                      code: dept.code,
                                      description: dept.description || '',
                                      division_id: dept.division_id,
                                      manager_id: dept.manager_id || ''
                                    });
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="Edit Department"
                                >
                                  <Edit2 className="w-3 h-3 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                  className="p-1 hover:bg-red-50 rounded"
                                  title="Delete Department"
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Department Manager Section */}
                            <div className="space-y-2 mt-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <UserCheck className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    Manager: {getManagerName(dept.manager_id)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-gray-500 flex justify-between">
                              <span>{division.name} Division</span>
                              <span>ID: {dept.id}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Division Modal */}
      {(showAddDivision || showEditDivision) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {showEditDivision ? 'Edit Division' : 'Add New Division'}
              </h4>
              <button onClick={() => {
                setShowAddDivision(false);
                setShowEditDivision(null);
              }} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division Name *</label>
                <input
                  type="text"
                  value={newDivision.name}
                  onChange={(e) => setNewDivision({...newDivision, name: e.target.value})}
                  placeholder="Enter division name..."
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDivision.description}
                  onChange={(e) => setNewDivision({...newDivision, description: e.target.value})}
                  placeholder="Enter division description..."
                  rows="2"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Theme</label>
                <select
                  value={newDivision.color}
                  onChange={(e) => setNewDivision({...newDivision, color: e.target.value})}
                  className="input-field"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                  <option value="purple">Purple</option>
                  <option value="red">Red</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddDivision(false);
                    setShowEditDivision(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditDivision ? handleEditDivision : handleAddDivision}
                  className="flex-1 btn-primary"
                  disabled={!newDivision.name.trim()}
                >
                  {showEditDivision ? 'Update Division' : 'Create Division'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Department Modal */}
      {(showAddDepartment || showEditDepartment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {showEditDepartment ? 'Edit Department' : 'Add Department'}
              </h4>
              <button onClick={() => {
                setShowAddDepartment(null);
                setShowEditDepartment(null);
              }} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  placeholder="Enter department name..."
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
                  placeholder="e.g., PROD_A, QC_IN, etc."
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Enter department description..."
                  rows="2"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division *</label>
                <select
                  value={newDepartment.division_id}
                  onChange={(e) => setNewDepartment({...newDepartment, division_id: e.target.value})}
                  className="input-field"
                  required
                  disabled={!!showEditDepartment}
                >
                  <option value="">Select Division</option>
                  {divisions.map(div => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Manager</label>
                <select
                  value={newDepartment.manager_id}
                  onChange={(e) => setNewDepartment({...newDepartment, manager_id: e.target.value})}
                  className="input-field"
                >
                  <option value="">Select Manager (Optional)</option>
                  {allUsers
                    .filter(user => 
                      user.role === 'division_manager' || 
                      user.role === 'employee'
                    )
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.employee_id || 'No ID'}) - {user.role}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddDepartment(null);
                    setShowEditDepartment(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditDepartment ? handleEditDepartment : handleAddDepartment}
                  className="flex-1 btn-primary"
                  disabled={!newDepartment.name.trim() || !newDepartment.code.trim() || !newDepartment.division_id}
                >
                  {showEditDepartment ? 'Update Department' : 'Add Department'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Divisions;