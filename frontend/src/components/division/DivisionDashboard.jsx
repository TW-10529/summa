import React, { useState, useEffect } from 'react';
import DivisionAttendance from './DivisionAttendance';
import DivisionSchedule from './DivisionSchedule';
import DepartmentManagement from './DepartmentManagement';
import DivisionApprovals from './DivisionApprovals';
import DivisionReports from './DivisionReports';
import { Building2, Users, Clock, BarChart3, TrendingUp, Layers, Bell, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionManagerService } from '../../services/divisionManagerService';
import { useNavigate } from 'react-router-dom'; // ADD THIS

const DivisionDashboard = ({ activeTab }) => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ADD THIS
  const [loading, setLoading] = useState(true);
  const [divisionStats, setDivisionStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);

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
        
        // Load attendance for dashboard
        if (activeTab === 'dashboard') {
          const attendance = await divisionManagerService.getAttendance();
          setAttendanceData(attendance);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeTab]);

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

  // FIXED: Helper function to get color classes
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
    if (loading) {
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
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Division Notifications</h3>
                <p className="text-gray-600">Send and manage notifications for your division</p>
              </div>
              <button 
                className="btn-primary flex items-center space-x-2"
                onClick={async () => {
                  const notification = {
                    title: 'Division Announcement',
                    message: 'Important announcement for all departments',
                    type: 'announcement',
                    departments: 'all'
                  };
                  await divisionManagerService.sendNotification(notification);
                  alert('Notification sent successfully!');
                }}
              >
                <Bell className="w-4 h-4" /> {/* Changed from Clock to Bell */}
                <span>Send Division Alert</span>
              </button>
            </div>

            <div className="card p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Send Division Notification</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                  <select id="notificationType" className="input-field">
                    <option value="info">Information</option>
                    <option value="alert">Alert</option>
                    <option value="warning">Warning</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    id="notificationTitle"
                    type="text"
                    placeholder="Enter notification title..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="notificationMessage"
                    placeholder="Enter notification message..."
                    rows="3"
                    className="input-field"
                  />
                </div>
                <button
                  className="btn-primary w-full"
                  onClick={async () => {
                    const title = document.getElementById('notificationTitle').value;
                    const message = document.getElementById('notificationMessage').value;
                    const type = document.getElementById('notificationType').value;
                    
                    if (!title || !message) {
                      alert('Please fill in all fields');
                      return;
                    }
                    
                    const notification = {
                      title,
                      message,
                      type,
                      departments: 'all'
                    };
                    
                    const result = await divisionManagerService.sendNotification(notification);
                    if (result.message) {
                      alert('Notification sent successfully!');
                      document.getElementById('notificationTitle').value = '';
                      document.getElementById('notificationMessage').value = '';
                    }
                  }}
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return (
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="card p-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Overview</h3>
                <div className="space-y-3">
                  {departments.map((dept, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                  ))}
                </div>
              </div>
              
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { 
                      label: 'Generate Division Schedule', 
                      icon: Clock,
                      action: async () => {
                        const schedule = await divisionManagerService.getSchedule();
                        console.log('Schedule generated:', schedule);
                        alert('Schedule generated successfully!');
                      }
                    },
                    { 
                      label: 'View Attendance Reports', 
                      icon: FileText,
                      action: async () => {
                        const report = await divisionManagerService.generateReport('attendance');
                        console.log('Report generated:', report);
                        alert('Attendance report generated!');
                        navigate('/division/reports'); // FIXED: Use navigate instead
                      }
                    },
                    { 
                      label: 'Manage Department Managers', 
                      icon: Users,
                      action: () => {
                        navigate('/division/departments'); // FIXED: Use navigate instead
                      }
                    },
                    { 
                      label: 'Check Pending Approvals', 
                      icon: CheckCircle,
                      action: async () => {
                        const approvals = await divisionManagerService.getPendingApprovals();
                        console.log('Pending approvals:', approvals);
                        navigate('/division/approvals'); // FIXED: Use navigate instead
                      }
                    },
                  ].map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.action}
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
          {divisionStats?.division?.name || 'Division'} Dashboard
        </h2>
        <p className="text-gray-600 mt-1">
          {activeTab === 'dashboard' 
            ? 'Division management overview'
            : `Manage division ${activeTab.replace('-', ' ')}`}
        </p>
      </div>
      {renderContent()}
    </div>
  );
};

export default DivisionDashboard;