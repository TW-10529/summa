import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        // Try to get unread count from API
        const response = await notificationService.getUnreadCount();
        if (response && typeof response === 'object' && 'unread' in response) {
          setUnreadCount(response.unread);
        } else if (typeof response === 'number') {
          setUnreadCount(response);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('factory_notifications');
        if (saved) {
          const notifications = JSON.parse(saved);
          // Filter based on user role
          const userNotifications = notifications.filter(n => {
            if (!user) return false;
            if (user.role === 'admin') return true;
            if (n.target === 'all') return true;
            if (user.role === 'division_manager' && n.target === 'division_managers') return true;
            if (user.role === 'department_manager' && n.target === 'department_managers') return true;
            if (n.target === 'specific' && n.target_ids?.includes(user.id)) return true;
            return false;
          });
          const unread = userNotifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      }
    };

    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleSettingsClick = () => {
    setShowProfile(false);
    if (user.role === 'admin') {
      navigate('/admin/settings');
    } else if (user.role === 'division_manager') {
      navigate('/division/settings');
    } else if (user.role === 'department_manager') {
      navigate('/manager/settings');
    } else {
      navigate('/employee/profile');
    }
  };

  const handleNotificationsClick = () => {
    setShowProfile(false);
    if (user.role === 'admin') {
      navigate('/admin/notifications');
    } else if (user.role === 'division_manager') {
      navigate('/division/notifications');
    } else if (user.role === 'department_manager') {
      navigate('/manager/notifications');
    } else {
      navigate('/employee/notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-64 z-10">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees, shifts, or reports..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            onClick={handleNotificationsClick}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button 
            onClick={handleSettingsClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || user?.username || 'User'}`}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Employee'}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={handleSettingsClick}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;