import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Edit2, Trash2, Download, Upload, RotateCcw, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionManagerService } from '../../services/divisionManagerService';

const DivisionSchedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('all');
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({
    department_id: '',
    shift_name: '',
    start_time: '08:00',
    end_time: '16:00',
    required_employees: 10,
    notes: ''
  });

  useEffect(() => {
    loadSchedule();
    loadDepartments();
  }, [selectedDate, selectedDept]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await divisionManagerService.getSchedule(selectedDate, selectedDate);
      setSchedule(data);
    } catch (error) {
      console.error('Error loading schedule:', error);
      // Use mock data if API fails
      setSchedule({
        division_id: 1,
        date_range: { start: selectedDate, end: selectedDate },
        departments: [
          {
            department_id: 1,
            department_name: 'Production Line A',
            shifts: [
              {
                shift_id: 1,
                shift_name: 'Morning Shift',
                start_time: '08:00',
                end_time: '16:00',
                employees_scheduled: 25,
                coverage_rate: 100,
                employees: [
                  { id: 1, name: 'John Doe', role: 'Operator' },
                  { id: 2, name: 'Jane Smith', role: 'Supervisor' }
                ]
              }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await divisionManagerService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);
      const schedule = await divisionManagerService.getSchedule();
      setSchedule(schedule);
      alert('✅ Schedule generated successfully!');
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async () => {
    try {
      // Validate
      if (!newShift.department_id || !newShift.shift_name) {
        alert('Please fill in all required fields');
        return;
      }

      // Add shift to schedule
      const updatedSchedule = { ...schedule };
      const deptIndex = updatedSchedule.departments.findIndex(
        d => d.department_id.toString() === newShift.department_id
      );
      
      if (deptIndex !== -1) {
        const newShiftObj = {
          shift_id: Date.now(),
          ...newShift,
          employees_scheduled: 0,
          coverage_rate: 0,
          employees: []
        };
        
        updatedSchedule.departments[deptIndex].shifts.push(newShiftObj);
        setSchedule(updatedSchedule);
        
        // Reset form
        setNewShift({
          department_id: '',
          shift_name: '',
          start_time: '08:00',
          end_time: '16:00',
          required_employees: 10,
          notes: ''
        });
        setShowAddShift(false);
        
        alert('✅ Shift added successfully!');
      } else {
        alert('Department not found');
      }
    } catch (error) {
      console.error('Error adding shift:', error);
      alert('Failed to add shift. Please try again.');
    }
  };

  const handleDeleteShift = (deptId, shiftId) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;
    
    const updatedSchedule = { ...schedule };
    const deptIndex = updatedSchedule.departments.findIndex(d => d.department_id === deptId);
    
    if (deptIndex !== -1) {
      updatedSchedule.departments[deptIndex].shifts = updatedSchedule.departments[deptIndex].shifts.filter(
        s => s.shift_id !== shiftId
      );
      setSchedule(updatedSchedule);
      alert('✅ Shift deleted successfully!');
    }
  };

  const handleExportSchedule = () => {
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `schedule_${selectedDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Schedule exported successfully!');
  };

  const calculateTotalCoverage = () => {
    if (!schedule?.departments) return 0;
    
    let totalRequired = 0;
    let totalScheduled = 0;
    
    schedule.departments.forEach(dept => {
      dept.shifts.forEach(shift => {
        totalRequired += shift.required_employees || 10;
        totalScheduled += shift.employees_scheduled || 0;
      });
    });
    
    return totalRequired > 0 ? Math.round((totalScheduled / totalRequired) * 100) : 0;
  };

  const getDepartmentStats = (deptId) => {
    const dept = schedule?.departments.find(d => d.department_id === deptId);
    if (!dept) return { required: 0, scheduled: 0, coverage: 0 };
    
    let required = 0;
    let scheduled = 0;
    
    dept.shifts.forEach(shift => {
      required += shift.required_employees || 10;
      scheduled += shift.employees_scheduled || 0;
    });
    
    const coverage = required > 0 ? Math.round((scheduled / required) * 100) : 0;
    
    return { required, scheduled, coverage };
  };

  const getCoverageColor = (coverage) => {
    if (coverage >= 100) return 'bg-green-100 text-green-800';
    if (coverage >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading && !schedule) {
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
          <h3 className="text-lg font-semibold text-gray-800">Division Schedule</h3>
          <p className="text-gray-600">Manage and view division-wide schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportSchedule}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowAddShift(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="input-field"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
            <button
              onClick={handleGenerateSchedule}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generate Schedule</span>
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Coverage</label>
            <div className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">
                  {calculateTotalCoverage()}%
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getCoverageColor(calculateTotalCoverage())}`}>
                  {calculateTotalCoverage() >= 100 ? 'Full' : calculateTotalCoverage() >= 80 ? 'Good' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Schedule Cards */}
      {schedule?.departments && schedule.departments
        .filter(dept => selectedDept === 'all' || dept.department_id.toString() === selectedDept)
        .map(dept => {
          const stats = getDepartmentStats(dept.department_id);
          
          return (
            <div key={dept.department_id} className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-gray-800">{dept.department_name}</h4>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {stats.scheduled}/{stats.required} employees
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm ${getCoverageColor(stats.coverage).split(' ')[1]}`}>
                        {stats.coverage}% coverage
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setNewShift(prev => ({ ...prev, department_id: dept.department_id }));
                    setShowAddShift(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Shift</span>
                </button>
              </div>

              {/* Shifts Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {dept.shifts.map(shift => (
                      <tr key={shift.shift_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{shift.shift_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {shift.start_time} - {shift.end_time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {shift.employees_scheduled || 0}/{shift.required_employees || 10}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-blue-500" 
                                style={{ width: `${shift.coverage_rate || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{shift.coverage_rate || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            shift.coverage_rate >= 100 
                              ? 'bg-green-100 text-green-800' 
                              : shift.coverage_rate >= 80 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {shift.coverage_rate >= 100 ? 'Full' : shift.coverage_rate >= 80 ? 'Adequate' : 'Understaffed'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // Edit shift
                                alert('Edit shift feature coming soon!');
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteShift(dept.department_id, shift.shift_id)}
                              className="text-red-600 hover:text-red-800"
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

              {/* Shift Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Shifts</span>
                    <p className="text-lg font-bold">{dept.shifts.length}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Required Employees</span>
                    <p className="text-lg font-bold">{stats.required}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Scheduled Employees</span>
                    <p className="text-lg font-bold">{stats.scheduled}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Overall Coverage</span>
                    <p className={`text-lg font-bold ${getCoverageColor(stats.coverage).split(' ')[1]}`}>
                      {stats.coverage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {/* Add Shift Modal */}
      {showAddShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-lg font-semibold text-gray-800">Add New Shift</h4>
              <button
                onClick={() => setShowAddShift(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={newShift.department_id}
                  onChange={(e) => setNewShift({...newShift, department_id: e.target.value})}
                  className="input-field"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input
                  type="text"
                  value={newShift.shift_name}
                  onChange={(e) => setNewShift({...newShift, shift_name: e.target.value})}
                  placeholder="e.g., Morning Shift, Night Shift"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newShift.start_time}
                    onChange={(e) => setNewShift({...newShift, start_time: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newShift.end_time}
                    onChange={(e) => setNewShift({...newShift, end_time: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Employees</label>
                <input
                  type="number"
                  value={newShift.required_employees}
                  onChange={(e) => setNewShift({...newShift, required_employees: parseInt(e.target.value) || 1})}
                  min="1"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={newShift.notes}
                  onChange={(e) => setNewShift({...newShift, notes: e.target.value})}
                  placeholder="Any additional notes..."
                  rows="3"
                  className="input-field"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddShift(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddShift}
                  className="flex-1 btn-primary"
                >
                  Add Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionSchedule;