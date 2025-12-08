import React, { useState, useEffect } from 'react';
import { 
  Bell, Mail, AlertTriangle, CheckCircle, XCircle, Clock, 
  Send, Trash2, Loader2, Users, Building2, Filter, Check, X, Eye,
  Download
} from 'lucide-react';
import { notificationService } from '../../services/api';
import { departmentService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Load division departments
      if (user.division_id) {
        const depts = await departmentService.getDepartments(user.division_id);
        setDepartments(depts);
      }
      
      // Load notifications for current user
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications || response || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setNotifications([
        {
          id: 1,
          title: 'System Maintenance',
          message: 'Scheduled maintenance tonight at 2 AM',
          type: 'info',
          priority: 'medium',
          target_type: 'all',
          read: false,
          created_at: new Date().toISOString(),
          created_by_name: 'Admin',
          source: 'admin'
        },
        {
          id: 2,
          title: 'Shift Schedule Update',
          message: 'Production line schedule has been updated for next week',
          type: 'info',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          created_by_name: 'Division Manager',
          source: 'division'
        },
        {
          id: 3,
          title: 'Attendance Alert',
          message: 'Low attendance reported in Packaging department',
          type: 'warning',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          created_by_name: 'Quality Manager',
          source: 'department'
        },
        {
          id: 4,
          title: 'Weekly Report Ready',
          message: 'Weekly division report is ready for review',
          type: 'success',
          read: false,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          created_by_name: 'System',
          source: 'system'
        },
        {
          id: 5,
          title: 'Important Announcement',
          message: 'All department meetings scheduled for Friday 10 AM',
          type: 'alert',
          read: true,
          created_at: new Date(Date.now() - 259200000).toISOString(),
          created_by_name: 'Admin',
          source: 'admin'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in title and message');
      return;
    }

    try {
      setSendingNotification(true);
      
      const notificationData = {
        ...newNotification,
        division_id: user.division_id,
        created_by_name: user.full_name || 'Division Manager',
        source: 'division'
      };
      
      if (newNotification.target === 'specific_department' && selectedDepartment) {
        notificationData.department_id = selectedDepartment;
        notificationData.department_name = departments.find(d => d.id === parseInt(selectedDepartment))?.name || '';
      }
      
      const response = await notificationService.sendNotification(notificationData);
      
      // Add to notifications list
      const sentNotification = {
        id: Date.now(),
        ...notificationData,
        read: false,
        created_at: new Date().toISOString(),
        created_by_name: user.full_name || 'Division Manager'
      };
      
      setNotifications([sentNotification, ...notifications]);
      
      alert('✅ Notification sent successfully!');
      
      // Reset form
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        target: 'all'
      });
      setSelectedDepartment('');
      
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const handleExportNotifications = () => {
    const dataStr = JSON.stringify(notifications, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `notifications_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Notifications exported successfully!');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'alert': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'alert': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getSourceBadge = (source) => {
    switch(source) {
      case 'admin': return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">From Admin</span>;
      case 'division': return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">From Division</span>;
      case 'department': return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">From Department</span>;
      case 'system': return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">System</span>;
      default: return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{source}</span>;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    if (filter === 'sent') return n.source === 'division';
    if (filter === 'received') return n.source !== 'division';
    return true;
  });

  if (loading) {
    return (
      <div className="card p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Division Notifications</h3>
          <p className="text-gray-600">Send notifications and view messages</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportNotifications}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleMarkAllAsRead}
            className="btn-secondary flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Send className="w-5 h-5 text-blue-500" />
          <span>Send New Notification</span>
        </h4>
        <form onSubmit={handleSendNotification}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="input-field"
                placeholder="e.g., Shift Schedule Update"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Enter notification message..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="input-field"
                >
                  <option value="info">Information</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="alert">Alert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={newNotification.target}
                  onChange={(e) => {
                    setNewNotification({...newNotification, target: e.target.value});
                    if (e.target.value !== 'specific_department') {
                      setSelectedDepartment('');
                    }
                  }}
                  className="input-field"
                >
                  <option value="all">All Division Members</option>
                  <option value="department_managers">Department Managers Only</option>
                  <option value="employees">Employees Only</option>
                  <option value="specific_department">Specific Department</option>
                </select>
              </div>
            </div>
            
            {newNotification.target === 'specific_department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input-field"
                  required={newNotification.target === 'specific_department'}
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button
              type="submit"
              disabled={sendingNotification}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {sendingNotification ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['all', 'unread', 'read', 'sent', 'received'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 font-medium text-sm ${filter === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Notifications</h4>
            <p className="text-gray-500">
              {filter === 'all' ? 'You have no notifications yet.' :
               filter === 'unread' ? 'No unread notifications.' :
               filter === 'sent' ? 'No sent notifications.' :
               filter === 'received' ? 'No received notifications.' :
               'No read notifications.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-4 ${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-gray-800">{notification.title}</h5>
                      <div className="flex items-center space-x-2">
                        {notification.source && getSourceBadge(notification.source)}
                        {!notification.read && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      </span>
                      {notification.created_by_name && (
                        <span className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>From: {notification.created_by_name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1 hover:bg-blue-100 rounded"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Summary */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Notification Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total Notifications</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">
              {notifications.filter(n => !n.read).length}
            </div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">
              {notifications.filter(n => n.source === 'division').length}
            </div>
            <div className="text-sm text-gray-600">Sent by You</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">
              {notifications.filter(n => n.source === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">From Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;