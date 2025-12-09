import React, { useState, useEffect } from 'react';
import DivisionAttendance from './DivisionAttendance';
import DivisionSchedule from './DivisionSchedule';
import DepartmentManagement from './DepartmentManagement';
import DivisionApprovals from './DivisionApprovals';
import DivisionReports from './DivisionReports';
import Notifications from './Notifications';
import DivisionSettings from './DivisionSettings';
import { 
  Building2, Users, Clock, BarChart3, TrendingUp, Layers, 
  Bell, FileText, CheckCircle, Settings as SettingsIcon, ArrowLeft,
  LogIn, LogOut, AlertTriangle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionManagerService } from '../../services/divisionManagerService';
import { useNavigate } from 'react-router-dom';

const DivisionDashboard = ({ activeTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [divisionStats, setDivisionStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  
  // Check-in/out states
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lateStatus, setLateStatus] = useState(null);
  const [alreadyCheckedInToday, setAlreadyCheckedInToday] = useState(false);
  const [alreadyCheckedOutToday, setAlreadyCheckedOutToday] = useState(false);
  
  const shiftStartTime = '08:00'; // Shift starts at 8:00 AM

  // Generate unique localStorage keys for each manager
  const getManagerStorageKey = (key) => {
    const managerId = user?.id || 'unknown';
    return `${key}_DivManager_${managerId}`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load division stats
        const stats = await divisionManagerService.getDashboardStats();
        setDivisionStats(stats);
        
        // Load departments
        const depts = await divisionManagerService.getDepartments();
        setDepartments(depts);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Check local storage for today's check-in/out - USING UNIQUE KEYS
    const today = new Date().toDateString();
    const storedCheckInDate = localStorage.getItem(getManagerStorageKey('lastCheckInDate'));
    const storedCheckOutDate = localStorage.getItem(getManagerStorageKey('lastCheckOutDate'));
    
    if (storedCheckInDate === today) {
      setAlreadyCheckedInToday(true);
      const storedCheckInTime = localStorage.getItem(getManagerStorageKey('checkInTime'));
      if (storedCheckInTime) {
        setCheckInTime(new Date(storedCheckInTime));
        setIsCheckedIn(true);
        checkLateStatus(new Date(storedCheckInTime));
      }
    }
    
    if (storedCheckOutDate === today) {
      setAlreadyCheckedOutToday(true);
      const storedCheckOutTime = localStorage.getItem(getManagerStorageKey('checkOutTime'));
      if (storedCheckOutTime) {
        setCheckOutTime(new Date(storedCheckOutTime));
      }
    }
  }, [activeTab, user]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Helper functions for check-in/out
  const formatTime = (date) => {
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  };

  const parseTimeString = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const checkLateStatus = (checkInTime) => {
    const shiftStart = parseTimeString(shiftStartTime);
    const checkIn = new Date(checkInTime);
    const lateMs = checkIn.getTime() - shiftStart.getTime();
    const lateMinutes = Math.floor(lateMs / (1000 * 60));
    
    let status = 'On Time';
    let type = 'success';
    let display = 'On Time';
    
    if (lateMinutes <= 0) {
      status = 'On Time';
      type = 'success';
      display = 'On Time';
    } else if (lateMinutes <= 15) {
      status = 'Slightly Late';
      type = 'warning';
      display = 'Late Login (Slightly Late)';
    } else if (lateMinutes <= 60) {
      status = 'Very Late';
      type = 'error';
      display = 'Late Login (Very Late)';
    } else {
      const hours = Math.floor(lateMinutes / 60);
      const remainingMinutes = lateMinutes % 60;
      status = 'Very Late';
      type = 'error';
      display = `Late Login (${hours}h ${remainingMinutes}m)`;
    }
    
    setLateStatus({
      status,
      minutes: lateMinutes,
      type,
      display
    });
    
    // Send attendance to admin system (simulated)
    sendAttendanceToAdmin(checkInTime, lateMinutes, status);
  };

  const sendAttendanceToAdmin = async (checkInTime, lateMinutes, status) => {
    try {
      // This would be an API call to admin system
      const attendanceRecord = {
        managerId: user?.id,
        managerName: user?.name,
        division: divisionStats?.division?.name,
        date: new Date().toISOString().split('T')[0],
        checkInTime: new Date(checkInTime).toISOString(),
        lateMinutes,
        status,
        timestamp: new Date().toISOString(),
        managerEmail: user?.email // Added for better identification
      };
      
      console.log('Sending attendance to admin system:', attendanceRecord);
      
      // Store locally with unique key for each manager
      localStorage.setItem(getManagerStorageKey('managerAttendanceRecord'), JSON.stringify(attendanceRecord));
      
    } catch (error) {
      console.error('Error sending attendance to admin:', error);
    }
  };

  const handleCheckIn = () => {
    const now = new Date();
    const today = now.toDateString();
    
    if (alreadyCheckedInToday) {
      alert('You have already checked in today!');
      return;
    }
    
    setCheckInTime(now);
    setCheckOutTime(null);
    setIsCheckedIn(true);
    setAlreadyCheckedInToday(true);
    
    // Save to localStorage with UNIQUE key for each division manager
    localStorage.setItem(getManagerStorageKey('lastCheckInDate'), today);
    localStorage.setItem(getManagerStorageKey('checkInTime'), now.toISOString());
    
    // Check if manager is late
    checkLateStatus(now);
    
    console.log(`${user?.name || 'Division Manager'} checked in at:`, now);
  };

  const handleCheckOut = () => {
    const now = new Date();
    const today = now.toDateString();
    
    if (alreadyCheckedOutToday) {
      alert('You have already checked out today!');
      return;
    }
    
    if (!alreadyCheckedInToday) {
      alert('You need to check in first!');
      return;
    }
    
    setCheckOutTime(now);
    setIsCheckedIn(false);
    setAlreadyCheckedOutToday(true);
    
    // Save to localStorage with UNIQUE key
    localStorage.setItem(getManagerStorageKey('lastCheckOutDate'), today);
    localStorage.setItem(getManagerStorageKey('checkOutTime'), now.toISOString());
    
    // Update admin record with check-out time
    updateAdminAttendanceWithCheckOut(now);
    
    console.log(`${user?.name || 'Division Manager'} checked out at:`, now);
  };

  const updateAdminAttendanceWithCheckOut = async (checkOutTime) => {
    try {
      const existingRecord = localStorage.getItem(getManagerStorageKey('managerAttendanceRecord'));
      if (existingRecord) {
        const record = JSON.parse(existingRecord);
        record.checkOutTime = checkOutTime.toISOString();
        localStorage.setItem(getManagerStorageKey('managerAttendanceRecord'), JSON.stringify(record));
        console.log('Updated admin record with check-out:', record);
      }
    } catch (error) {
      console.error('Error updating admin record:', error);
    }
  };

  const getStatusColor = (type) => {
    switch(type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return null;
    }
  };

  const stats = [
    { 
      label: 'Total Departments', 
      value: divisionStats?.stats?.total_departments || 0, 
      icon: Layers, 
      color: 'blue', 
      change: '+0' 
    },
    { 
      label: 'Total Employees', 
      value: divisionStats?.stats?.total_employees || 0, 
      icon: Users, 
      color: 'green', 
      change: '+5' 
    },
    { 
      label: 'Today Attendance', 
      value: divisionStats?.stats?.today_attendance ? `${divisionStats.stats.today_attendance}%` : '0%', 
      icon: TrendingUp, 
      color: 'orange', 
      change: '+3%' 
    },
    { 
      label: 'Active Shifts', 
      value: divisionStats?.stats?.active_shifts || 0, 
      icon: Clock, 
      color: 'purple', 
      change: '-2' 
    },
  ];

  // Helper function to get color classes
  const getColorClass = (color, type = 'bg') => {
    const colorMap = {
      blue: type === 'bg' ? 'bg-blue-50' : 'text-blue-600',
      green: type === 'bg' ? 'bg-green-50' : 'text-green-600',
      orange: type === 'bg' ? 'bg-orange-50' : 'text-orange-600',
      purple: type === 'bg' ? 'bg-purple-50' : 'text-purple-600',
    };
    return colorMap[color] || 'bg-blue-50 text-blue-600';
  };

  const renderContent = () => {
    if (loading && activeTab === 'dashboard') {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'attendance':
        return <DivisionAttendance divisionStats={divisionStats} />;
      case 'schedule':
        return <DivisionSchedule />;
      case 'departments':
        return <DepartmentManagement departments={departments} />;
      case 'approvals':
        return <DivisionApprovals />;
      case 'reports':
        return <DivisionReports />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <DivisionSettings />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {divisionStats?.division?.name || 'Division'} Dashboard
            </h1>
            <p className="text-blue-100">
              {divisionStats?.division?.description || 'Manage your division operations'}
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{divisionStats?.stats?.total_departments || 0} Departments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{divisionStats?.stats?.total_employees || 0} Employees</span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <Building2 className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Manager Attendance Section */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Attendance Today</h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Current Time</p>
                <p className="text-xl font-bold text-gray-800">{formatTime(currentTime)}</p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Check In</p>
                <p className="text-xl font-bold text-green-600">
                  {checkInTime ? formatTime(checkInTime) : '--:--'}
                </p>
              </div>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Check Out</p>
                <p className="text-xl font-bold text-red-600">
                  {checkOutTime ? formatTime(checkOutTime) : '--:--'}
                </p>
              </div>
            </div>
            
            {/* Late Status Display */}
            {checkInTime && lateStatus && (
              <div className="flex items-center space-x-2 mb-4">
                {getStatusIcon(lateStatus.type)}
                <span className={`font-medium ${lateStatus.type === 'error' ? 'text-red-600' : lateStatus.type === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                  {lateStatus.display}
                </span>
              </div>
            )}
            
            {/* Manager's Shift Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Your Shift</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    Manager Shift ({shiftStartTime} - 17:00)
                  </p>
                  <p className="text-sm text-gray-600">Division Manager - {divisionStats?.division?.name}</p>
                </div>
                {checkInTime && lateStatus && (
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(lateStatus.type)}`}>
                    {getStatusIcon(lateStatus.type)}
                    <span className="font-medium">
                      {lateStatus.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCheckIn}
              disabled={isCheckedIn || alreadyCheckedInToday}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                isCheckedIn || alreadyCheckedInToday
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <LogIn className="w-5 h-5 mr-2" />
              {alreadyCheckedInToday ? 'Already Checked In' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!isCheckedIn || alreadyCheckedOutToday || !alreadyCheckedInToday}
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                !isCheckedIn || alreadyCheckedOutToday || !alreadyCheckedInToday
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {alreadyCheckedOutToday ? 'Already Checked Out' : 'Check Out'}
            </button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
          <span className="text-sm text-gray-600">
            {isCheckedIn ? 'Currently checked in and working' : 'Currently checked out'}
            {checkInTime && lateStatus && lateStatus.minutes > 0 && (
              <span className={`ml-2 ${lateStatus.type === 'error' ? 'text-red-600' : lateStatus.type === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                ({lateStatus.display})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              if (index === 0) navigate('/division/departments');
              else if (index === 1) navigate('/division/attendance');
              else if (index === 2) navigate('/division/attendance');
              else if (index === 3) navigate('/division/schedule');
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClass(stat.color, 'bg')}`}>
                {React.createElement(stat.icon, { 
                  className: getColorClass(stat.color, 'text') 
                })}
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Department Overview */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Department Overview</h3>
          <button 
            onClick={() => navigate('/division/departments')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Manage Departments</span>
            <Building2 className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {departments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No departments found</p>
            </div>
          ) : (
            departments.slice(0, 6).map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/division/departments?dept=${dept.id}`)}
              >
                <div>
                  <p className="font-medium text-gray-800">{dept.name}</p>
                  <p className="text-sm text-gray-600">
                    Manager: {dept.manager?.name || 'Not assigned'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{dept.employee_count || 0}</p>
                  <p className="text-xs text-gray-500">employees</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {departments.length > 6 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => navigate('/division/departments')}
              className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all {departments.length} departments →
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <button 
            onClick={() => navigate('/division/settings')}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View logs</span>
            <FileText className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { action: 'Updated department schedule', user: 'You', time: '10 min ago' },
            { action: 'Approved leave request', user: 'John Doe', time: '1 hour ago' },
            { action: 'Added new employee', user: 'Sarah Johnson', time: '2 hours ago' },
            { action: 'Generated monthly report', user: 'System', time: 'Yesterday' },
            { action: 'Updated division settings', user: 'You', time: '2 days ago' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.user === 'You' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Users className={`w-4 h-4 ${
                  activity.user === 'You' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing 5 of recent activities
            </span>
            <button 
              onClick={() => navigate('/division/settings')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'dashboard' ? `${divisionStats?.division?.name || 'Division'} Dashboard` :
               activeTab === 'settings' ? 'Division Settings' :
               activeTab === 'notifications' ? 'Division Notifications' :
               activeTab === 'departments' ? 'Department Management' :
               activeTab === 'approvals' ? 'Approval Requests' :
               activeTab === 'reports' ? 'Division Reports' :
               activeTab === 'attendance' ? 'Attendance Management' :
               activeTab === 'schedule' ? 'Schedule Management' :
               `Division ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}`}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeTab === 'dashboard' 
                ? 'Division management overview'
                : activeTab === 'settings'
                ? 'Configure division preferences and settings'
                : activeTab === 'notifications'
                ? 'Send and manage division notifications'
                : activeTab === 'departments'
                ? 'Manage departments and assign managers'
                : activeTab === 'approvals'
                ? 'Review and approve requests'
                : activeTab === 'reports'
                ? 'Generate and view division reports'
                : activeTab === 'attendance'
                ? 'Track and manage division attendance'
                : activeTab === 'schedule'
                ? 'Manage division work schedules'
                : `Manage division ${activeTab.replace('-', ' ')}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => navigate('/division')}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="pb-8 px-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default DivisionDashboard;