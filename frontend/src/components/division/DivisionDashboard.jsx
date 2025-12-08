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
  Bell, FileText, CheckCircle, Settings as SettingsIcon, ArrowLeft 
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