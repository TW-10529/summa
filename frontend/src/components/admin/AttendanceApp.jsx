import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Calendar, Users } from 'lucide-react';
import { userService } from '../../services/api';

const AttendanceApp = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    overtime: 0
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange]);

  // Function to get ALL division manager attendances
  const getAllDivisionManagerAttendances = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const managerAttendances = [];
      
      // Loop through all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check for BOTH old and new key formats
        if (key && (key.includes('managerAttendanceRecord_DivManager') || key === 'managerAttendanceRecord')) {
          try {
            const storedRecord = localStorage.getItem(key);
            if (storedRecord) {
              const record = JSON.parse(storedRecord);
              
              // Check if record is from today
              if (record.date === today) {
                // Get check-in/check-out times
                const checkInTime = record.checkInTime ? new Date(record.checkInTime) : null;
                const checkOutTime = record.checkOutTime ? new Date(record.checkOutTime) : null;
                
                // Format times for display
                const formatTime = (date) => {
                  if (!date) return '—';
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                };
                
                // Determine status based on late minutes
                let status = 'Present';
                if (record.lateMinutes > 0 && record.lateMinutes <= 15) {
                  status = 'Late';
                } else if (record.lateMinutes > 15) {
                  status = 'Late';
                }
                
                // Calculate overtime (hours worked beyond 8 hours)
                let overtime = '0h';
                if (checkInTime && checkOutTime) {
                  const workMs = checkOutTime.getTime() - checkInTime.getTime();
                  const workHours = workMs / (1000 * 60 * 60);
                  const regularHours = 8;
                  const overtimeHours = Math.max(0, workHours - regularHours);
                  overtime = overtimeHours > 0 ? `${overtimeHours.toFixed(1)}h` : '0h';
                }
                
                // Extract manager ID from the key or use from record
                let managerId = '001';
                if (key.includes('_DivManager_')) {
                  managerId = key.split('_DivManager_')[1] || record.managerId || '001';
                } else {
                  managerId = record.managerId || '001';
                }
                
                managerAttendances.push({
                  id: `manager-${managerId}`,
                  name: record.managerName || 'Division Manager',
                  employeeId: `MGR-${managerId}`,
                  date: record.date,
                  checkIn: formatTime(checkInTime),
                  checkOut: formatTime(checkOutTime),
                  shift: 'Manager Shift',
                  status: status,
                  overtime: overtime,
                  isManager: true,
                  division: record.division || 'Division',
                  managerId: managerId,
                  lateMinutes: record.lateMinutes || 0,
                  timestamp: record.timestamp || new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error(`Error parsing manager attendance from key ${key}:`, error);
          }
        }
      }
      
      // Sort by timestamp (most recent first)
      managerAttendances.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      return managerAttendances;
    } catch (error) {
      console.error('Error getting all manager attendances:', error);
      return [];
    }
  };

  // Function to get ALL employee attendances
  const getAllEmployeeAttendances = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const employeeAttendances = [];
      
      // Loop through all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check for employee attendance keys (from the first component)
        if (key && (key === 'attendanceRecords' || key.includes('employeeAttendance'))) {
          try {
            const storedAttendance = localStorage.getItem(key);
            if (storedAttendance) {
              const records = JSON.parse(storedAttendance);
              
              // If it's an array, process all records
              if (Array.isArray(records)) {
                records.forEach(record => {
                  // Check if record is from today
                  if (record.date === today && record.checkIn !== '—') {
                    employeeAttendances.push({
                      id: `employee-${record.date}-${Math.random()}`,
                      name: 'Employee', // Default name, you might want to get this from user data
                      employeeId: `EMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                      date: record.date,
                      checkIn: record.checkIn,
                      checkOut: record.checkOut,
                      shift: 'Employee Shift',
                      status: record.status,
                      overtime: record.overtime > 0 ? `${record.overtime}h` : '0h',
                      isManager: false,
                      hours: record.hours,
                      timestamp: new Date().toISOString()
                    });
                  }
                });
              }
            }
          } catch (error) {
            console.error(`Error parsing employee attendance from key ${key}:`, error);
          }
        }
      }
      
      // Also check for individual employee records (from the first component's format)
      const todayStr = new Date().toISOString().split('T')[0];
      const checkInDate = localStorage.getItem('lastCheckInDate');
      
      if (checkInDate === new Date().toDateString()) {
        const checkInTime = localStorage.getItem('checkInTime');
        const checkOutTime = localStorage.getItem('checkOutTime');
        
        if (checkInTime) {
          const checkInDate = new Date(checkInTime);
          const checkIn = checkInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          let checkOut = '—';
          if (checkOutTime) {
            const checkOutDate = new Date(checkOutTime);
            checkOut = checkOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
          
          // Determine status
          const shiftStart = new Date();
          shiftStart.setHours(8, 0, 0, 0);
          let status = 'Present';
          if (checkInDate > shiftStart) {
            status = 'Late';
          }
          
          employeeAttendances.push({
            id: 'employee-current',
            name: 'Current Employee',
            employeeId: 'EMP-001',
            date: todayStr,
            checkIn: checkIn,
            checkOut: checkOut,
            shift: 'Regular Shift',
            status: status,
            overtime: '0h',
            isManager: false,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Remove duplicates
      const uniqueAttendances = employeeAttendances.filter((record, index, self) =>
        index === self.findIndex(t => t.id === record.id)
      );
      
      return uniqueAttendances;
    } catch (error) {
      console.error('Error getting all employee attendances:', error);
      return [];
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get ALL manager attendances
      const managerAttendances = getAllDivisionManagerAttendances();
      console.log('Found manager attendances:', managerAttendances);
      
      // Get ALL employee attendances
      const employeeAttendances = getAllEmployeeAttendances();
      console.log('Found employee attendances:', employeeAttendances);
      
      // Combine all attendances
      let allAttendance = [...managerAttendances, ...employeeAttendances];
      
      // If no attendance records found in localStorage, use mock data
      if (allAttendance.length === 0) {
        console.log('No attendance records found in localStorage, using mock data');
        const usersData = await userService.getUsers();
        setUsers(usersData);
        
        // Generate mock attendance data based on users
        const mockAttendance = usersData.map(user => {
          const status = Math.random() > 0.1 ? 'Present' : 'Absent';
          const checkIn = status === 'Present' ? '08:0' + Math.floor(Math.random() * 9) : '—';
          const checkOut = status === 'Present' ? '16:0' + Math.floor(Math.random() * 9) : '—';
          
          return {
            id: user.id,
            name: user.full_name,
            employeeId: user.employee_id || `EMP${user.id.toString().padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            checkIn,
            checkOut,
            shift: ['Morning', 'Afternoon', 'Night'][Math.floor(Math.random() * 3)],
            status: checkIn > '08:05' ? 'Late' : status,
            overtime: Math.random() > 0.7 ? `${Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 6)}h` : '0h',
            isManager: Math.random() > 0.8 // Randomly assign some as managers
          };
        });
        
        allAttendance = mockAttendance;
      }
      
      setAttendanceRecords(allAttendance);
      
      // Calculate stats (including all managers and employees)
      const present = allAttendance.filter(r => r.status === 'Present').length;
      const absent = allAttendance.filter(r => r.status === 'Absent').length;
      const late = allAttendance.filter(r => r.status === 'Late').length;
      const overtime = allAttendance.reduce((sum, r) => {
        if (r.overtime) {
          const hoursStr = r.overtime.replace('h', '');
          const hours = parseFloat(hoursStr);
          return sum + (isNaN(hours) ? 0 : hours);
        }
        return sum;
      }, 0);
      
      setStats({ present, absent, late, overtime });
      
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Late': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Absent': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.name.toLowerCase().includes(search.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      (record.isManager && 'manager'.includes(search.toLowerCase()));
    
    const matchesDept = filterDept === 'all' || true;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Name', 'Employee ID', 'Role', 'Date', 'Shift', 'Check-in', 'Check-out', 'Status', 'Overtime', 'Late Minutes'],
      ...filteredRecords.map(r => [
        r.name, 
        r.employeeId, 
        r.isManager ? 'Division Manager' : 'Employee',
        r.date, 
        r.shift, 
        r.checkIn, 
        r.checkOut, 
        r.status, 
        r.overtime,
        r.lateMinutes || '0'
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleRefresh = () => {
    fetchAttendanceData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Attendance Management</h3>
            <p className="text-gray-600">Track and manage employee attendance</p>
          </div>
          <button 
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </button>
        </div>
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading attendance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Attendance Management</h3>
          <p className="text-gray-600">Track and manage employee and manager attendance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button onClick={handleRefresh} className="btn-secondary flex items-center space-x-2">
            <Loader2 className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button onClick={handleExport} className="btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Present Today</p>
              <p className="text-xl font-bold text-gray-800">{stats.present}</p>
              <p className="text-xs text-gray-500">
                {attendanceRecords.filter(r => r.isManager && r.status === 'Present').length} managers
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Absent Today</p>
              <p className="text-xl font-bold text-gray-800">{stats.absent}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Late Arrivals</p>
              <p className="text-xl font-bold text-gray-800">{stats.late}</p>
              <p className="text-xs text-gray-500">
                {attendanceRecords.filter(r => r.isManager && r.status === 'Late').length} managers
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overtime Hours</p>
              <p className="text-xl font-bold text-gray-800">{stats.overtime}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, employee ID, or 'manager'..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <select 
              value={filterDept} 
              onChange={(e) => setFilterDept(e.target.value)}
              className="input-field"
            >
              <option value="all">All Departments</option>
              <option value="production">Production</option>
              <option value="quality">Quality</option>
              <option value="maintenance">Maintenance</option>
              <option value="management">Management</option>
            </select>
          </div>
          <div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Debug info */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-800">
              <strong>Attendance Summary:</strong> Found {attendanceRecords.length} total attendance records
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Managers: {attendanceRecords.filter(r => r.isManager).length} | 
              Employees: {attendanceRecords.filter(r => !r.isManager).length}
            </p>
          </div>
          <div className="text-xs text-blue-600">
            Data includes both managers and employees
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift / Division</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`hover:bg-gray-50 ${record.isManager ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.name}`}
                          alt=""
                        />
                        {record.isManager && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                            <Users className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{record.name}</div>
                          {record.isManager ? (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Manager
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                              Employee
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.employeeId}
                          {record.isManager && record.division && (
                            <span className="ml-2">• {record.division} Division</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm px-2 py-1 rounded ${
                      record.isManager 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.shift}
                    </span>
                    {record.lateMinutes > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Late: {record.lateMinutes}m
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.checkIn}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.checkOut}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.overtime}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(record.status)}
                      <span className={`text-sm ${
                        record.status === 'Present' ? 'text-green-700' :
                        record.status === 'Late' ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {record.status}
                        {record.lateMinutes > 60 && (
                          <span className="ml-1 text-xs">
                            ({Math.floor(record.lateMinutes/60)}h {record.lateMinutes%60}m)
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRecords.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-4">
                <Users className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No attendance records found</h4>
              <p className="text-gray-600 mb-4">
                {search ? 'Try a different search term' : 'No data available for the selected filters'}
              </p>
              <button 
                onClick={handleRefresh}
                className="btn-primary px-4 py-2"
              >
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceApp;