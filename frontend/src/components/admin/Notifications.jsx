import React, { useState, useEffect } from 'react';
import { Bell, Mail, AlertTriangle, CheckCircle, XCircle, Clock, Send, Trash2, Loader2 } from 'lucide-react';
import { userService } from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNotification, setNewNotification] = useState({
    type: 'info',
    title: '',
    message: '',
    target: 'all'
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getUsers();
      setUsers(usersData);
      
      // Load notifications from localStorage (or API when implemented)
      const saved = localStorage.getItem('factory_notifications');
      if (saved) {
        setNotifications(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
      case 'alert': return 'bg-red-50 border-red-100';
      case 'warning': return 'bg-yellow-50 border-yellow-100';
      case 'success': return 'bg-green-50 border-green-100';
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('factory_notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('factory_notifications', JSON.stringify(updated));
  };

  const sendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in title and message');
      return;
    }
    
    const newNotif = {
      id: Date.now(),
      type: newNotification.type,
      title: newNotification.title,
      message: newNotification.message,
      target: newNotification.target,
      time: new Date().toLocaleString(),
      read: false
    };
    
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('factory_notifications', JSON.stringify(updated));
    
    // Reset form
    setNewNotification({
      type: 'info',
      title: '',
      message: '',
      target: 'all'
    });
    
    alert('Notification sent successfully!');
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('factory_notifications', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Notifications Center</h3>
            <p className="text-gray-600">Manage system alerts and announcements</p>
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
          <h3 className="text-lg font-semibold text-gray-800">Notifications Center</h3>
          <p className="text-gray-600">Manage system alerts and announcements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={markAllAsRead} className="btn-secondary">
            Mark All as Read
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Send Alert</span>
          </button>
        </div>
      </div>

      {/* Send New Notification */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Send className="w-5 h-5" />
          <span>Send New Notification</span>
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={newNotification.target}
                onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}
                className="input-field"
              >
                <option value="all">All Employees</option>
                <option value="admin">Admins Only</option>
                <option value="division_manager">Division Managers</option>
                <option value="employee">Employees Only</option>
                <option value="specific">Specific User</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
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
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Notification</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Recent Notifications</h4>
          <span className="text-sm text-gray-600">
            {notifications.filter(n => !n.read).length} unread
          </span>
        </div>
        
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="card p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">No Notifications</h4>
              <p className="text-gray-600">No notifications have been sent yet.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card p-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div>
                      <h5 className="font-medium text-gray-800">{notification.title}</h5>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {notification.type.toUpperCase()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {notification.target}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
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