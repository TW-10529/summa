import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, Filter, Download, Printer, Settings, Eye,
  Plus, Search, ChevronDown, ChevronUp, CheckCircle, XCircle, Edit2,
  Trash2, RefreshCw, AlertCircle, Building2, Loader2, BarChart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionService, departmentService, userService } from '../../services/api';

const ScheduleControl = () => {
  const { user: currentUser } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [filters, setFilters] = useState({
    date: '',
    shift: 'all',
    department: 'all',
    status: 'all'
  });
  
  const [newSchedule, setNewSchedule] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    department_id: '',
    division_id: '',
    start_time: '08:00',
    end_time: '16:00',
    employees: [],
    notes: ''
  });

  // Event listener for quick actions
  useEffect(() => {
    const handleOpenCreateScheduleModal = () => {
      setShowCreateModal(true);
      setMessage({ 
        type: 'info', 
        text: 'Create schedule form is now open. Fill in the details to create a new schedule.' 
      });
    };

    window.addEventListener('openCreateScheduleModal', handleOpenCreateScheduleModal);

    return () => {
      window.removeEventListener('openCreateScheduleModal', handleOpenCreateScheduleModal);
    };
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchDivisions();
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Fetch schedules from API
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockSchedules = [
        { 
          id: 1, 
          date: '2024-01-15', 
          shift: 'Morning', 
          shift_type: 'morning',
          department: 'Production', 
          department_id: 1,
          division_id: 1,
          employees: 45, 
          employee_ids: [1, 2, 3, 4, 5],
          start_time: '08:00',
          end_time: '16:00',
          status: 'scheduled',
          created_at: '2024-01-14T10:00:00Z',
          notes: 'Regular production schedule'
        },
        { 
          id: 2, 
          date: '2024-01-15', 
          shift: 'Afternoon', 
          shift_type: 'afternoon',
          department: 'Quality', 
          department_id: 2,
          division_id: 2,
          employees: 22, 
          employee_ids: [6, 7, 8, 9],
          start_time: '16:00',
          end_time: '00:00',
          status: 'completed', 
          created_at: '2024-01-14T14:00:00Z',
          notes: 'Quality control shift'
        },
        // Add more mock data...
      ];
      
      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setMessage({ type: 'error', text: 'Failed to load schedules' });
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
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await userService.getUsers();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getShiftTimes = (shift) => {
    const times = {
      'morning': { start: '08:00', end: '16:00' },
      'afternoon': { start: '16:00', end: '00:00' },
      'night': { start: '00:00', end: '08:00' },
      'custom': { start: newSchedule.start_time, end: newSchedule.end_time }
    };
    return times[shift] || times.morning;
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.date || !newSchedule.department_id) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      // In a real app, this would be an API call
      const newScheduleData = {
        id: schedules.length + 1,
        date: newSchedule.date,
        shift: newSchedule.shift.charAt(0).toUpperCase() + newSchedule.shift.slice(1),
        shift_type: newSchedule.shift,
        department: departments.find(d => d.id === parseInt(newSchedule.department_id))?.name || 'Unknown',
        department_id: parseInt(newSchedule.department_id),
        division_id: parseInt(newSchedule.division_id),
        employees: newSchedule.employees.length,
        employee_ids: newSchedule.employees,
        start_time: getShiftTimes(newSchedule.shift).start,
        end_time: getShiftTimes(newSchedule.shift).end,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        notes: newSchedule.notes
      };

      setSchedules([newScheduleData, ...schedules]);
      setShowCreateModal(false);
      setNewSchedule({
        date: new Date().toISOString().split('T')[0],
        shift: 'morning',
        department_id: '',
        division_id: '',
        start_time: '08:00',
        end_time: '16:00',
        employees: [],
        notes: ''
      });
      
      setMessage({ type: 'success', text: 'Schedule created successfully!' });
    } catch (error) {
      console.error('Error creating schedule:', error);
      setMessage({ type: 'error', text: 'Failed to create schedule' });
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      // In a real app, this would be an API call
      setSchedules(schedules.map(s => 
        s.id === selectedSchedule.id ? selectedSchedule : s
      ));
      
      setShowEditModal(false);
      setSelectedSchedule(null);
      setMessage({ type: 'success', text: 'Schedule updated successfully!' });
    } catch (error) {
      console.error('Error updating schedule:', error);
      setMessage({ type: 'error', text: 'Failed to update schedule' });
    }
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== id));
      setMessage({ type: 'success', text: 'Schedule deleted successfully!' });
    }
  };

  const handleToggleScheduleStatus = (id, currentStatus) => {
    const nextStatus = {
      'scheduled': 'in-progress',
      'in-progress': 'completed',
      'completed': 'scheduled',
      'cancelled': 'scheduled'
    }[currentStatus] || 'scheduled';

    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, status: nextStatus } : s
    ));
    
    setMessage({ type: 'success', text: `Schedule marked as ${nextStatus}` });
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filters.date && schedule.date !== filters.date) return false;
    if (filters.shift !== 'all' && schedule.shift_type !== filters.shift) return false;
    if (filters.department !== 'all' && schedule.department_id !== parseInt(filters.department)) return false;
    if (filters.status !== 'all' && schedule.status !== filters.status) return false;
    return true;
  });

  const stats = {
    total: schedules.length,
    scheduled: schedules.filter(s => s.status === 'scheduled').length,
    inProgress: schedules.filter(s => s.status === 'in-progress').length,
    completed: schedules.filter(s => s.status === 'completed').length,
    employeesScheduled: schedules.reduce((sum, s) => sum + s.employees, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Schedule Control</h3>
          <p className="text-gray-600">Manage and control work schedules</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="btn-secondary flex items-center space-x-2"
            onClick={fetchSchedules}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button 
            className="btn-primary flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Create Schedule</span>
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`card p-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' :
          message.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? 
              <CheckCircle className="w-5 h-5 text-green-600" /> :
              message.type === 'error' ?
              <XCircle className="w-5 h-5 text-red-600" /> :
              <AlertCircle className="w-5 h-5 text-blue-600" />
            }
            <span className={
              message.type === 'success' ? 'text-green-700' :
              message.type === 'error' ? 'text-red-700' :
              'text-blue-700'
            }>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Schedules</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          <div className="text-sm text-gray-600">Scheduled</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.employeesScheduled}</div>
          <div className="text-sm text-gray-600">Employees</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
            <select
              value={filters.shift}
              onChange={(e) => setFilters({...filters, shift: e.target.value})}
              className="input-field"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="input-field"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                date: '',
                shift: 'all',
                department: 'all',
                status: 'all'
              })}
              className="w-full btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <span className="text-gray-600">Loading schedules...</span>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No Schedules Found</h4>
            <p className="text-gray-600 mb-6">
              {Object.values(filters).some(f => f !== '' && f !== 'all')
                ? 'No schedules match your filters.'
                : 'No schedules created yet. Create your first schedule!'}
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(schedule.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{schedule.shift}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{schedule.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{schedule.employees}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {schedule.start_time} - {schedule.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleScheduleStatus(schedule.id, schedule.status)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                            title="Change Status"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditSchedule(schedule)}
                            className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
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
            
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing {filteredSchedules.length} of {schedules.length} schedules
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Create New Schedule</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shift *
                    </label>
                    <select
                      value={newSchedule.shift}
                      onChange={(e) => {
                        const shift = e.target.value;
                        const times = getShiftTimes(shift);
                        setNewSchedule({
                          ...newSchedule,
                          shift,
                          start_time: times.start,
                          end_time: times.end
                        });
                      }}
                      className="input-field"
                    >
                      <option value="morning">Morning (8AM - 4PM)</option>
                      <option value="afternoon">Afternoon (4PM - 12AM)</option>
                      <option value="night">Night (12AM - 8AM)</option>
                      <option value="custom">Custom Hours</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Division
                    </label>
                    <select
                      value={newSchedule.division_id}
                      onChange={(e) => {
                        setNewSchedule({
                          ...newSchedule,
                          division_id: e.target.value,
                          department_id: ''
                        });
                      }}
                      className="input-field"
                    >
                      <option value="">Select Division</option>
                      {divisions.map(division => (
                        <option key={division.id} value={division.id}>{division.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={newSchedule.department_id}
                      onChange={(e) => setNewSchedule({...newSchedule, department_id: e.target.value})}
                      className="input-field"
                      required
                      disabled={!newSchedule.division_id}
                    >
                      <option value="">Select Department</option>
                      {departments
                        .filter(dept => !newSchedule.division_id || dept.division_id === parseInt(newSchedule.division_id))
                        .map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
                
                {newSchedule.shift === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newSchedule.start_time}
                        onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newSchedule.end_time}
                        onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newSchedule.notes}
                    onChange={(e) => setNewSchedule({...newSchedule, notes: e.target.value})}
                    className="input-field min-h-[100px]"
                    placeholder="Add any notes or special instructions..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSchedule}
                  className="btn-primary"
                  disabled={!newSchedule.date || !newSchedule.department_id}
                >
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Edit Schedule</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedSchedule.status}
                      onChange={(e) => setSelectedSchedule({...selectedSchedule, status: e.target.value})}
                      className="input-field"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employees Count
                    </label>
                    <input
                      type="number"
                      value={selectedSchedule.employees}
                      onChange={(e) => setSelectedSchedule({
                        ...selectedSchedule, 
                        employees: parseInt(e.target.value) || 0
                      })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={selectedSchedule.notes || ''}
                    onChange={(e) => setSelectedSchedule({...selectedSchedule, notes: e.target.value})}
                    className="input-field min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSchedule}
                  className="btn-primary"
                >
                  Update Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleControl;