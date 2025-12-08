import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Printer, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Calendar } from 'lucide-react';
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

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
      
      // Generate mock attendance data based on users
      const mockAttendance = usersData.map(user => {
        const status = Math.random() > 0.1 ? 'Present' : 'Absent';
        const checkIn = status === 'Present' ? '08:0' + Math.floor(Math.random() * 9) : '—';
        const checkOut = status === 'Present' ? '16:0' + Math.floor(Math.random() * 9) : '—';
        const late = checkIn > '08:05' ? 'Late' : 'Present';
        
        return {
          id: user.id,
          name: user.full_name,
          employeeId: user.employee_id || `EMP${user.id.toString().padStart(3, '0')}`,
          date: new Date().toISOString().split('T')[0],
          checkIn,
          checkOut,
          shift: ['Morning', 'Afternoon', 'Night'][Math.floor(Math.random() * 3)],
          status: checkIn > '08:05' ? 'Late' : status,
          overtime: Math.random() > 0.7 ? `${Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 6)}h` : '0h'
        };
      });
      
      setAttendanceRecords(mockAttendance);
      
      // Calculate stats
      const present = mockAttendance.filter(r => r.status === 'Present').length;
      const absent = mockAttendance.filter(r => r.status === 'Absent').length;
      const late = mockAttendance.filter(r => r.status === 'Late').length;
      const overtime = mockAttendance.reduce((sum, r) => {
        const hours = parseFloat(r.overtime);
        return sum + (isNaN(hours) ? 0 : hours);
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
      record.employeeId.toLowerCase().includes(search.toLowerCase());
    
    // For now, using mock department filter
    const matchesDept = filterDept === 'all' || true;
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Name', 'Employee ID', 'Date', 'Shift', 'Check-in', 'Check-out', 'Status', 'Overtime'],
      ...filteredRecords.map(r => [r.name, r.employeeId, r.date, r.shift, r.checkIn, r.checkOut, r.status, r.overtime])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Attendance Management</h3>
            <p className="text-gray-600">Track and manage employee attendance</p>
          </div>
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
          <p className="text-gray-600">Track and manage employee attendance</p>
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
                placeholder="Search by name or employee ID..."
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

      {/* Attendance Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.name}`}
                        alt=""
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{record.name}</div>
                        <div className="text-xs text-gray-500">{record.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {record.shift}
                    </span>
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
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRecords.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No attendance records found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceApp;