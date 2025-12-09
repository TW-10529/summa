import React, { useState, useEffect } from 'react';
import ShiftView from './ShiftView';
import Profile from './Profile';
import Attendance from './Attendance';
import Requests from './Requests';
import EmployeeNotifications from './EmployeeNotifications';
import { Clock, Calendar, CheckCircle, AlertCircle, LogIn, LogOut, AlertTriangle } from 'lucide-react';

const EmployeeDashboard = ({ activeTab }) => {
  // Friend's added states for check-in/out functionality
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lateStatus, setLateStatus] = useState(null);
  const [alreadyCheckedInToday, setAlreadyCheckedInToday] = useState(false);
  const [alreadyCheckedOutToday, setAlreadyCheckedOutToday] = useState(false);

  // Your original data
  const shiftStartTime = '08:00'; // Shift starts at 8:00 AM
  const upcomingShifts = [
    { date: 'Today', shift: 'Morning (08:00 - 16:00)', location: 'Production Line A' },
    { date: 'Tomorrow', shift: 'Morning (08:00 - 16:00)', location: 'Production Line B' },
    { date: 'Jan 17', shift: 'Afternoon (16:00 - 00:00)', location: 'Quality Check' },
  ];

  // Friend's useEffect hooks for localStorage and time updates
  useEffect(() => {
    const today = new Date().toDateString();
    const storedCheckInDate = localStorage.getItem('lastCheckInDate');
    const storedCheckOutDate = localStorage.getItem('lastCheckOutDate');
    
    if (storedCheckInDate === today) {
      setAlreadyCheckedInToday(true);
      // Load stored check-in time
      const storedCheckInTime = localStorage.getItem('checkInTime');
      if (storedCheckInTime) {
        setCheckInTime(new Date(storedCheckInTime));
        setIsCheckedIn(true);
        checkLateStatus(new Date(storedCheckInTime));
      }
    }
    
    if (storedCheckOutDate === today) {
      setAlreadyCheckedOutToday(true);
      // Load stored check-out time
      const storedCheckOutTime = localStorage.getItem('checkOutTime');
      if (storedCheckOutTime) {
        setCheckOutTime(new Date(storedCheckOutTime));
      }
    }
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Friend's helper functions
  const formatTime = (date) => {
    return date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  };

  const parseTimeString = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const calculateLateTime = (checkInTime) => {
    const shiftStart = parseTimeString(shiftStartTime);
    const checkIn = new Date(checkInTime);
    
    const lateMs = checkIn.getTime() - shiftStart.getTime();
    const lateMinutes = Math.floor(lateMs / (1000 * 60));
    
    if (lateMinutes >= 60) {
      const hours = Math.floor(lateMinutes / 60);
      const remainingMinutes = lateMinutes % 60;
      return {
        minutes: lateMinutes,
        display: `${hours}h ${remainingMinutes}m`,
        isHours: true
      };
    } else {
      return {
        minutes: lateMinutes,
        display: `${lateMinutes}m`,
        isHours: false
      };
    }
  };

  const checkLateStatus = (checkInTime) => {
    const shiftStart = parseTimeString(shiftStartTime);
    const checkIn = new Date(checkInTime);
    const lateMs = checkIn.getTime() - shiftStart.getTime();
    const lateMinutes = Math.floor(lateMs / (1000 * 60));
    
    if (lateMinutes <= 0) {
      setLateStatus({
        status: 'On Time',
        minutes: 0,
        type: 'success',
        display: 'On Time'
      });
    } else if (lateMinutes <= 5) {
      setLateStatus({
        status: 'Slightly Late',
        minutes: lateMinutes,
        type: 'warning',
        display: 'Late Login (Slightly Late)'
      });
    } else if (lateMinutes <= 15) {
      setLateStatus({
        status: 'Late',
        minutes: lateMinutes,
        type: 'warning',
        display: 'Late Login'
      });
    } else if (lateMinutes <= 20) {
      setLateStatus({
        status: '20 Minutes Late',
        minutes: lateMinutes,
        type: 'warning',
        display: 'Late Login (20 Minutes)'
      });
    } else if (lateMinutes <= 25) {
      setLateStatus({
        status: '25 Minutes Late',
        minutes: lateMinutes,
        type: 'error',
        display: 'Late Login (25 Minutes)'
      });
    } else if (lateMinutes <= 60) {
      setLateStatus({
        status: 'Very Late',
        minutes: lateMinutes,
        type: 'error',
        display: 'Late Login (Very Late)'
      });
    } else {
      const hours = Math.floor(lateMinutes / 60);
      const remainingMinutes = lateMinutes % 60;
      setLateStatus({
        status: 'Very Late',
        minutes: lateMinutes,
        type: 'error',
        display: `Late Login (${hours}h ${remainingMinutes}m)`
      });
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
    
    // Save to localStorage
    localStorage.setItem('lastCheckInDate', today);
    localStorage.setItem('checkInTime', now.toISOString());
    
    // Check if employee is late
    checkLateStatus(now);
    
    console.log('Checked in at:', now);
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
    setLateStatus(null); // Reset late status on check out
    
    // Save to localStorage
    localStorage.setItem('lastCheckOutDate', today);
    localStorage.setItem('checkOutTime', now.toISOString());
    
    console.log('Checked out at:', now);
  };

  // Friend's helper functions for UI
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

  const renderContent = () => {
    switch (activeTab) {
      case 'shifts':
        return <ShiftView />;
      case 'profile':
        return <Profile />;
      case 'attendance':
        return <Attendance />;
      case 'requests':
        return <Requests />;
      case 'notifications':
        return <EmployeeNotifications />;
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Banner - Your original design */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
                  <p className="text-blue-100">Check your schedule and attendance</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Clock className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Check In/Out Section - Friend's feature */}
            <div className="card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Attendance for Today</h3>
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
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(lateStatus.type)}
                      <span className={`font-medium ${lateStatus.type === 'error' ? 'text-red-600' : lateStatus.type === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {lateStatus.display}
                      </span>
                    </div>
                  )}
                  
                  {/* Today's Shift Info */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Today's Shift</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          Morning Shift ({shiftStartTime} - 16:00)
                        </p>
                        <p className="text-sm text-gray-600">Production Line A</p>
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
                </span>
              </div>
            </div>

            {/* Quick Stats - Combined: Your 3 stats + Friend's 1st stat */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Friend's: Today's Status */}
              <div className="card p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Today's Status</p>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {checkInTime ? (checkOutTime || alreadyCheckedOutToday ? 'Completed' : 'Working') : 'Not Started'}
                    </h3>
                    {lateStatus && lateStatus.minutes > 0 && (
                      <p className={`text-sm mt-1 ${lateStatus.type === 'error' ? 'text-red-600' : lateStatus.type === 'warning' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {lateStatus.display}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Your: Attendance This Month */}
              <div className="card p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-green-50">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attendance This Month</p>
                    <h3 className="text-2xl font-bold text-gray-800">96%</h3>
                  </div>
                </div>
              </div>

              {/* Your: Hours This Week */}
              <div className="card p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hours This Week</p>
                    <h3 className="text-2xl font-bold text-gray-800">38.5</h3>
                  </div>
                </div>
              </div>

              {/* Your: Upcoming Shifts */}
              <div className="card p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Shifts</p>
                    <h3 className="text-2xl font-bold text-gray-800">3</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Shifts & Quick Actions - Your original 2-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Your: Upcoming Shifts */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Shifts</h3>
                <div className="space-y-4">
                  {upcomingShifts.map((shift, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-800">{shift.date}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {shift.shift.split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-1">{shift.shift}</p>
                      <p className="text-sm text-gray-600">{shift.location}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your: Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Request Leave', icon: Calendar },
                    { label: 'Swap Shift', icon: Clock },
                    { label: 'Mark Attendance', icon: CheckCircle },
                    { label: 'Report Issue', icon: AlertCircle },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-700">{action.label}</span>
                      <action.icon className="w-5 h-5 text-gray-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">
          {activeTab === 'dashboard' ? 'Employee Dashboard' : activeTab.replace('-', ' ')}
        </h2>
        <p className="text-gray-600 mt-1">
          {activeTab === 'dashboard' 
            ? 'Your work schedule and information'
            : `Manage your ${activeTab.replace('-', ' ')}`}
        </p>
      </div>
      {renderContent()}
    </div>
  );
};

export default EmployeeDashboard;