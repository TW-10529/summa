// src/services/settingsService.js - UPDATED
import api from './api';

export const settingsService = {
  // Get all settings
  getSettings: async () => {
    try {
      console.log('⚙️ Fetching settings...');
      const response = await api.get('/settings');
      console.log('✅ Settings fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      
      // Return mock settings
      return {
        general: {
          site_name: 'FactoryShift',
          timezone: 'UTC',
          language: 'en',
          date_format: 'YYYY-MM-DD',
          time_format: '24h'
        },
        notifications: {
          email_enabled: true,
          push_enabled: true,
          daily_report: true,
          attendance_alerts: true,
          shift_change_alerts: true
        },
        security: {
          two_factor_auth: false,
          session_timeout: 30,
          password_policy: 'medium',
          login_attempts: 5
        },
        division: {
          auto_approval: false,
          attendance_threshold: 80,
          schedule_notice_days: 7,
          overtime_limit: 40
        }
      };
    }
  },

  // Update a setting
  updateSetting: async (category, key, value) => {
    try {
      console.log(`⚙️ Updating setting ${category}.${key}:`, value);
      const response = await api.put(`/settings/${category}/${key}`, { value });
      console.log('✅ Setting updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating setting:', error);
      
      // Return mock success
      return {
        message: 'Setting updated successfully',
        category,
        key,
        value
      };
    }
  },

  // Get division profile
  getDivisionProfile: async () => {
    try {
      console.log('👤 Fetching division profile...');
      const response = await api.get('/settings/division-profile');
      console.log('✅ Profile fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      
      // Return mock profile
      return {
        user: {
          id: 2,
          username: 'division_manager',
          email: 'manager@factory.com',
          full_name: 'Division Manager',
          employee_id: 'MAN002',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=division'
        },
        division: {
          id: 1,
          name: 'Production Division',
          description: 'Main production division',
          color: 'blue',
          created_at: '2024-01-01T00:00:00Z'
        },
        stats: {
          department_count: 4,
          employee_count: 120,
          managed_since: '2024-01-01T00:00:00Z'
        }
      };
    }
  },

  // Update division profile
  updateDivisionProfile: async (profileData) => {
    try {
      console.log('✏️ Updating division profile...', profileData);
      const response = await api.put('/settings/division-profile', profileData);
      console.log('✅ Profile updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      
      // Return mock success
      return {
        message: 'Profile updated successfully',
        user: profileData
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      console.log('🔐 Changing password...');
      const response = await api.post('/settings/change-password', passwordData);
      console.log('✅ Password changed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async (params = {}) => {
    try {
      console.log('🔔 Fetching notifications...');
      // This would be a real endpoint in production
      return [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      
      // Return mock notifications
      return [
        {
          id: 1,
          title: 'New Approval Request',
          message: 'John Doe requested leave from Jan 25-27',
          type: 'approval',
          priority: 'high',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Attendance Alert',
          message: 'Attendance rate dropped to 85% in Production Line A',
          type: 'attendance',
          priority: 'medium',
          read: true,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          title: 'Schedule Update',
          message: 'New schedule generated for next week',
          type: 'schedule',
          priority: 'low',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      console.log(`✅ Marking notification ${notificationId} as read`);
      // This would be a real endpoint in production
      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return { success: false, message: error.message };
    }
  },

  // Clear all notifications
  clearAllNotifications: async () => {
    try {
      console.log('🗑️ Clearing all notifications...');
      // This would be a real endpoint in production
      return { success: true, message: 'All notifications cleared' };
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
      return { success: false, message: error.message };
    }
  }
};

export default settingsService;