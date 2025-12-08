import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, Send, Trash2, Loader2, Users, Building, User } from 'lucide-react';
import { userService, notificationService, divisionService, departmentService } from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all',
    target_ids: []
  });
  const [users, setUsers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const userProfile = await userService.getProfile();
      setCurrentUser(userProfile);
      
      // Fetch notifications from API
      const notificationsResponse = await notificationService.getNotifications();
      
      // Handle response based on your backend structure
      if (notificationsResponse && notificationsResponse.notifications) {
        // New structure: { notifications: [], total: X, unread_count: Y }
        setNotifications(notificationsResponse.notifications || []);
        setTotalCount(notificationsResponse.total || 0);
        setUnreadCount(notificationsResponse.unread_count || 0);
      } else if (Array.isArray(notificationsResponse)) {
        // Old structure: array of notifications
        setNotifications(notificationsResponse);
        setTotalCount(notificationsResponse.length);
        setUnreadCount(notificationsResponse.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setTotalCount(0);
        setUnreadCount(0);
      }
      
      // Only fetch additional data if user can send notifications
      if (userProfile && ['admin', 'division_manager'].includes(userProfile.role)) {
        const usersData = await userService.getUsers();
        const divisionsData = await divisionService.getDivisions();
        const deptsData = await departmentService.getDepartments();
        
        setUsers(usersData);
        setDivisions(divisionsData);
        setDepartments(deptsData);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to localStorage for notifications
      const saved = localStorage.getItem('factory_notifications');
      if (saved) {
        const localNotifications = JSON.parse(saved);
        setNotifications(localNotifications);
        setTotalCount(localNotifications.length);
        setUnreadCount(localNotifications.filter(n => !n.read).length);
      }
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTargetIcon = (target) => {
    switch (target) {
      case 'all': return <Users className="w-4 h-4" />;
      case 'division_managers': return <Building className="w-4 h-4" />;
      case 'department_managers': return <Building className="w-4 h-4" />;
      case 'employees': return <Users className="w-4 h-4" />;
      case 'specific': return <User className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      
      // Update local state
      const updated = notifications.map(n => 
        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
      );
      setNotifications(updated);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
      // Fallback
      const updated = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(updated);
      setUnreadCount(prev => Math.max(0, prev - 1));
      localStorage.setItem('factory_notifications', JSON.stringify(updated));
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      
      const notificationToDelete = notifications.find(n => n.id === id);
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      setTotalCount(prev => prev - 1);
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      const notificationToDelete = notifications.find(n => n.id === id);
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      setTotalCount(prev => prev - 1);
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      localStorage.setItem('factory_notifications', JSON.stringify(updated));
    }
  };

  const sendNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      alert('Please fill in title and message');
      return;
    }
    
    if (!currentUser || !['admin', 'division_manager'].includes(currentUser.role)) {
      alert('You do not have permission to send notifications');
      return;
    }
    
    try {
      const notificationData = {
        title: newNotification.title.trim(),
        message: newNotification.message.trim(),
        type: newNotification.type,
        target: newNotification.target
      };
      
      if (newNotification.target === 'specific' && selectedUsers.length > 0) {
        notificationData.target_ids = selectedUsers.map(user => user.id);
      }
      
      const response = await notificationService.sendNotification(notificationData);
      
      if (response && (response.message || response.success)) {
        // Success - refresh data
        await fetchData();
        
        // Reset form
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          target: 'all',
          target_ids: []
        });
        setSelectedUsers([]);
        
        alert(response.message || 'Notification sent successfully!');
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert(`Error: ${error.response?.data?.detail || error.message || 'Failed to send notification'}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      const updated = notifications.map(n => ({ 
        ...n, 
        read: true,
        read_at: new Date().toISOString()
      }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
      localStorage.setItem('factory_notifications', JSON.stringify(updated));
    }
  };

  const handleUserSelect = (userId) => {
    if (!userId) return;
    const user = users.find(u => u.id === parseInt(userId));
    if (user && !selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const getTargetDisplay = (target) => {
    switch (target) {
      case 'all': return 'All Employees';
      case 'division_managers': return 'Division Managers';
      case 'department_managers': return 'Department Managers';
      case 'employees': return 'Employees';
      case 'specific': return 'Specific Users';
      default: return target;
    }
  };

  const canSendNotifications = currentUser && ['admin', 'division_manager'].includes(currentUser.role);
  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {isAdmin ? 'Admin Notifications' : 'My Notifications'}
            </h3>
            <p className="text-gray-600">Manage alerts and announcements</p>
          </div>
        </div>
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {isAdmin ? 'Admin Notifications Center' : 'My Notifications'}
          </h3>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Send and manage system-wide notifications' 
              : 'View your notifications and system alerts'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="btn-secondary"
            >
              Mark All as Read
            </button>
          )}
          {canSendNotifications && (
            <button 
              onClick={() => document.getElementById('send-notification-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Notification</span>
            </button>
          )}
        </div>
      </div>

      {/* Send New Notification Form */}
      {canSendNotifications && (
        <div id="send-notification-form" className="card p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Send New Notification</span>
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="input-field"
                >
                  <option value="info">Information</option>
                  <option value="alert">Alert</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={newNotification.target}
                  onChange={(e) => {
                    setNewNotification({...newNotification, target: e.target.value});
                    if (e.target.value !== 'specific') {
                      setSelectedUsers([]);
                    }
                  }}
                  className="input-field"
                >
                  <option value="all">All Employees</option>
                  <option value="division_managers">Division Managers</option>
                  <option value="department_managers">Department Managers</option>
                  <option value="employees">Employees Only</option>
                  <option value="specific">Specific Users</option>
                </select>
              </div>
            </div>

            {newNotification.target === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Users
                </label>
                <div className="flex gap-2">
                  <select
                    onChange={(e) => handleUserSelect(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Choose users...</option>
                    {users.filter(user => user.is_active).map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedUsers.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Selected Users ({selectedUsers.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers([])}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(user => (
                        <div 
                          key={user.id} 
                          className="flex items-center bg-white border border-gray-300 px-3 py-1.5 rounded-lg"
                        >
                          <img
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                            alt={user.full_name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-sm">{user.full_name}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedUser(user.id)}
                            className="ml-2 text-gray-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                placeholder="Enter notification title..."
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                placeholder="Enter notification message..."
                rows="3"
                className="input-field"
                required
              />
            </div>
            
            <button
              onClick={sendNotification}
              className="btn-primary flex items-center justify-center space-x-2 w-full md:w-auto"
              disabled={!newNotification.title.trim() || !newNotification.message.trim()}
            >
              <Send className="w-4 h-4" />
              <span>Send Notification</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">
            {isAdmin ? 'All Notifications' : 'Your Notifications'}
          </h4>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {totalCount} total • {unreadCount} unread
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="card p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No Notifications</h4>
              <p className="text-gray-600">
                {isAdmin 
                  ? 'No notifications have been sent yet.' 
                  : 'You have no notifications at the moment.'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card p-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-gray-800">{notification.title}</h5>
                        <div className="flex items-center space-x-2">
                          {!notification.read ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Read {notification.read_at ? new Date(notification.read_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {getTargetIcon(notification.target)}
                          <span>{getTargetDisplay(notification.target)}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                          {notification.type}
                        </span>
                        {notification.created_by_name && (
                          <span className="text-xs text-gray-500">
                            By: {notification.created_by_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this notification?')) {
                          deleteNotification(notification.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;