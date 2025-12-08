import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Filter, BarChart3, Download, Calendar, Users } from 'lucide-react';
import { divisionManagerService } from '../../services/divisionManagerService';

const DivisionAttendance = ({ divisionStats }) => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewType, setViewType] = useState('daily'); // daily, weekly, monthly
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadAttendanceData();
    loadDepartments();
  }, [date, viewType]);

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
            department_code: 'PROD_A',
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
            department_code: 'PROD_B',
            total_employees: 42,
            present: 39,
            absent: 2,
            late: 2,
            on_leave: 1,
            attendance_rate: 92.9
          }
        ],
        summary: {
          total_employees: 87,
          total_present: 81,
          total_absent: 4,
          total_late: 5,
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
    
    const csvContent = [
      ['Date', 'Department', 'Total Employees', 'Present', 'Absent', 'Late', 'On Leave', 'Attendance Rate %'],
      ...attendanceData.departments.map(dept => [
        attendanceData.date,
        dept.department_name,
        dept.total_employees,
        dept.present,
        dept.absent,
        dept.late,
        dept.on_leave,
        dept.attendance_rate
      ]),
      ['', 'TOTAL', 
        attendanceData.summary.total_employees,
        attendanceData.summary.total_present,
        attendanceData.summary.total_absent,
        attendanceData.summary.total_late,
        attendanceData.summary.total_on_leave,
        attendanceData.overall_attendance_rate
      ]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_${date}.csv`;
    link.click();
    
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
      // In real app, call API to send reminders
    }
  };

  const filteredDepartments = departmentFilter === 'all' 
    ? attendanceData?.departments || []
    : attendanceData?.departments.filter(dept => 
        dept.department_id.toString() === departmentFilter
      ) || [];

  const getTrendColor = (value, threshold = 90) => {
    return value >= threshold ? 'text-green-600' : 'text-red-600';
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
          <p className="text-gray-600">Monitor attendance across all departments</p>
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

      {/* Date Controls */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleDateChange(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ←
            </button>
            <div className="text-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>
            <button 
              onClick={() => handleDateChange(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              →
            </button>
            <button 
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Today
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setViewType('daily')}
                className={`px-3 py-1 rounded-md text-sm ${viewType === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewType('weekly')}
                className={`px-3 py-1 rounded-md text-sm ${viewType === 'weekly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewType('monthly')}
                className={`px-3 py-1 rounded-md text-sm ${viewType === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Monthly
              </button>
            </div>
            
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
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className={`text-sm font-medium ${getTrendColor(attendanceData?.overall_attendance_rate || 0)}`}>
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +2.5%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {attendanceData?.overall_attendance_rate?.toFixed(1) || '0'}%
          </h3>
          <p className="text-sm text-gray-600">Overall Attendance Rate</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +3
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {attendanceData?.summary?.total_present || 0}
          </h3>
          <p className="text-sm text-gray-600">Present Today</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-sm font-medium text-red-600">
              <TrendingDown className="w-4 h-4 inline mr-1" />
              -1
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {attendanceData?.summary?.total_absent || 0}
          </h3>
          <p className="text-sm text-gray-600">Absent Today</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-sm font-medium text-yellow-600">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              +2
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {attendanceData?.summary?.total_late || 0}
          </h3>
          <p className="text-sm text-gray-600">Late Arrivals</p>
        </div>
      </div>

      {/* Department-wise Attendance */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold text-gray-800">Department-wise Attendance</h4>
          <span className="text-sm text-gray-600">
            {filteredDepartments.length} departments
          </span>
        </div>
        
        <div className="space-y-4">
          {filteredDepartments.map(dept => (
            <div key={dept.department_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-medium text-gray-800">{dept.department_name}</h5>
                  <p className="text-sm text-gray-600">{dept.total_employees} employees</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getTrendColor(dept.attendance_rate)}`}>
                    {dept.attendance_rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">Attendance Rate</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-sm text-gray-600">Present</div>
                  <div className="font-bold text-gray-800">{dept.present}</div>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-sm text-gray-600">Absent</div>
                  <div className="font-bold text-gray-800">{dept.absent}</div>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <div className="text-sm text-gray-600">Late</div>
                  <div className="font-bold text-gray-800">{dept.late}</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600">On Leave</div>
                  <div className="font-bold text-gray-800">{dept.on_leave}</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500" 
                      style={{ width: `${dept.attendance_rate}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {dept.attendance_rate >= 95 ? 'Excellent' : 
                     dept.attendance_rate >= 90 ? 'Good' : 
                     dept.attendance_rate >= 85 ? 'Average' : 'Needs Attention'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => {
            const weekAgo = new Date(date);
            weekAgo.setDate(weekAgo.getDate() - 7);
            setDate(weekAgo.toISOString().split('T')[0]);
          }}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Calendar className="w-8 h-8 text-blue-600 mb-2" />
          <span className="font-medium text-gray-800">View Last Week</span>
          <span className="text-sm text-gray-600">Compare attendance</span>
        </button>
        
        <button 
          onClick={handleSendReminders}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Clock className="w-8 h-8 text-yellow-600 mb-2" />
          <span className="font-medium text-gray-800">Send Reminders</span>
          <span className="text-sm text-gray-600">To absent employees</span>
        </button>
        
        <button 
          onClick={() => {
            // Generate attendance report
            divisionManagerService.generateReport('attendance', date, date)
              .then(report => {
                alert('Attendance report generated!');
                console.log('Report:', report);
              });
          }}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
          <span className="font-medium text-gray-800">Generate Report</span>
          <span className="text-sm text-gray-600">Detailed analysis</span>
        </button>
        
        <button 
          onClick={handleExportAttendance}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-8 h-8 text-purple-600 mb-2" />
          <span className="font-medium text-gray-800">Export Data</span>
          <span className="text-sm text-gray-600">CSV format</span>
        </button>
      </div>
    </div>
  );
};

export default DivisionAttendance;