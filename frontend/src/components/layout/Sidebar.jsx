
// components/layout/Sidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, Users, Building2, Calendar, 
  Bell, CheckCircle, FileText, Settings, LogOut,
  BarChart3, Clock, Layers, UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/admin/employees' },
    { id: 'divisions', label: 'Divisions', icon: Building2, path: '/admin/divisions' },
    { id: 'attendance', label: 'Attendance', icon: BarChart3, path: '/admin/attendance' },
    { id: 'schedule-control', label: 'Schedule Control', icon: Calendar, path: '/admin/schedule-control' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const divisionManagerMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/division' },
    { id: 'attendance', label: 'Division Attendance', icon: BarChart3, path: '/division/attendance' },
    { id: 'schedule', label: 'Division Schedule', icon: Calendar, path: '/division/schedule' },
    { id: 'departments', label: 'Departments', icon: Layers, path: '/division/departments' },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle, path: '/division/approvals' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/division/reports' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/division/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/division/settings' },
  ];

  const departmentManagerMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/manager' },
    { id: 'attendance', label: 'Attendance', icon: BarChart3, path: '/manager/attendance' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/manager/schedule' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/manager/employees' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/manager/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/manager/settings' },
  ];

  const employeeMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee' },
    { id: 'schedule', label: 'My Schedule', icon: Calendar, path: '/employee/schedule' },
    { id: 'attendance', label: 'My Attendance', icon: BarChart3, path: '/employee/attendance' },
    { id: 'requests', label: 'My Requests', icon: CheckCircle, path: '/employee/requests' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/employee/notifications' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/employee/profile' },
  ];

  const getMenuItems = () => {
    switch (role) {
      case ROLES.ADMIN:
        return adminMenu;
      case ROLES.DIVISION_MANAGER:
        return divisionManagerMenu;
      case ROLES.DEPARTMENT_MANAGER:
        return departmentManagerMenu;
      case ROLES.EMPLOYEE:
        return employeeMenu;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 capitalize">
          {role.replace('_', ' ')} Panel
        </h3>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
