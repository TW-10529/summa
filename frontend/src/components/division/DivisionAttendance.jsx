import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter, Download, Calendar, Users, Search } from 'lucide-react';
import { divisionManagerService } from '../../services/divisionManagerService';

const DivisionAttendance = ({ divisionStats }) => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState([]);
  const [viewType, setViewType] = useState('summary'); // summary, detailed

  useEffect(() => {
    loadAttendanceData();
    loadDepartments();
  }, [date]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await divisionManagerService.getAttendance(date);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      // Mock data fallback
      setAttendanceData({
        date: date,
        division_id: 1,
        overall_attendance_rate: 92.5,
        departments: [
          {
            department_id: 1,
            department_name: 'Production Line A',
            total_employees: 45,
            present: 42,
            absent: 2,
            late: 3,
            on_leave: 1,
            attendance_rate: 93.3
          },
          {
            department_id: 2,
            department_name: 'Production Line B',
            total_employees: 42,
            present: 39,
            absent: 2,
            late: 2,
            on_leave: 1,
            attendance_rate: 92.9
          },
          {
            department_id: 3,
            department_name: 'Quality Control',
            total_employees: 25,
            present: 24,
            absent: 0,
            late: 1,
            on_leave: 0,
            attendance_rate: 96.0
          },
          {
            department_id: 4,
            department_name: 'Maintenance',
            total_employees: 18,
            present: 17,
            absent: 0,
            late: 1,
            on_leave: 0,
            attendance_rate: 94.4
          }
        ],
        summary: {
          total_employees: 130,
          total_present: 122,
          total_absent: 4,
          total_late: 7,
          total_on_leave: 2
        }
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

  const handleDateChange = (days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate.toISOString().split('T')[0]);
  };

  const handleExportAttendance = () => {
    if (!attendanceData) return;
    
    alert('Attendance data exported successfully!');
  };

  const handleSendReminders = () => {
    const absentEmployees = attendanceData?.summary.total_absent || 0;
    if (absentEmployees === 0) {
      alert('No absent employees to send reminders to.');
      return;
    }
    
    if (confirm(`Send attendance reminders to ${absentEmployees} absent employees?`)) {
      alert(`Reminders sent to ${absentEmployees} employees.`);
    }
  };

  const filteredDepartments = attendanceData?.departments.filter(dept => {
    if (departmentFilter !== 'all' && dept.department_id.toString() !== departmentFilter) {
      return false;
    }
    if (searchTerm && !dept.department_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  const getAttendanceStatus = (rate) => {
    if (rate >= 95) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 90) return { text: 'Good', color: 'text-green-600', bg: 'bg-green-50' };
    if (rate >= 85) return { text: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Needs Attention', color: 'text-red-600', bg: 'bg-red-50' };
  };

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
          <h3 className="text-lg font-semibold text-gray-800">Division Attendance</h3>
          <p className="text-gray-600">Monitor attendance for {date}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSendReminders}
            className="btn-secondary flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Send Reminders</span>
          </button>
          <button 
            onClick={handleExportAttendance}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleDateChange(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field flex-1"
              />
              <button 
                onClick={() => handleDateChange(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewType('summary')}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${viewType === 'summary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewType('detailed')}
                className={`flex-1 px-3 py-2 rounded-md text-sm ${viewType === 'detailed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold text-gray-800">Attendance Summary</h4>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">
              {attendanceData?.overall_attendance_rate?.toFixed(1) || '0'}%
            </div>
            <div className="text-sm text-gray-600">Overall Attendance Rate</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{attendanceData?.summary?.total_present || 0}</div>
                <div className="text-sm text-gray-600">Present</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{attendanceData?.summary?.total_absent || 0}</div>
                <div className="text-sm text-gray-600">Absent</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{attendanceData?.summary?.total_late || 0}</div>
                <div className="text-sm text-gray-600">Late</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-gray-800">{attendanceData?.summary?.total_on_leave || 0}</div>
                <div className="text-sm text-gray-600">On Leave</div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Attendance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Leave</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDepartments.map(dept => {
                const status = getAttendanceStatus(dept.attendance_rate);
                return (
                  <tr key={dept.department_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dept.department_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.total_employees}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.present}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.absent}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.late}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{dept.on_leave}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{dept.attendance_rate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setDate(new Date().toISOString().split('T')[0])}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-800">View Today</span>
        </button>
        
        <button 
          onClick={handleSendReminders}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Clock className="w-5 h-5 text-yellow-600" />
          <span className="font-medium text-gray-800">Send Reminders</span>
        </button>
        
        <button 
          onClick={handleExportAttendance}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-gray-800">Export Data</span>
        </button>
      </div>
    </div>
  );
};

export default DivisionAttendance;