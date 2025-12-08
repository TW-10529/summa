import React, { useState, useEffect } from 'react';
import { 
  Settings, Database, Key, Bell, Calendar, 
  Shield, UserCheck, Globe, Save, RefreshCw,
  Mail, Lock, Clock, Users, Building2
} from 'lucide-react';
import { userService } from '../../services/api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'FactoryShift Pro',
    timezone: 'UTC+05:30',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    weekStart: 'Monday',
    allowAutoSchedule: true,
    enableNotifications: true,
    minShiftHours: 8,
    maxShiftHours: 12,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    enable2FA: false,
    ipWhitelist: [],
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    shiftChangeAlerts: true,
    attendanceAlerts: true,
    overtimeAlerts: true,
    scheduleReminders: true,
    dailyReports: false,
    weeklyReports: true,
  });

  // User Management Settings
  const [userSettings, setUserSettings] = useState({
    allowSelfRegistration: false,
    requireApproval: true,
    defaultRole: 'employee',
    autoAssignDivision: false,
    maxEmployeesPerDept: 50,
    allowProfileUpdates: true,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    backupFrequency: 'daily',
    backupTime: '02:00',
    keepBackupsFor: 30, // days
    logRetention: 90, // days
    maintenanceMode: false,
    apiRateLimit: 100,
    enableAuditLog: true,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'system', label: 'System', icon: Database },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch settings from API
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // In a real app, you would save settings to API
      setTimeout(() => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      loadSettings();
      setMessage({ type: 'info', text: 'Settings reset to default' });
    }
  };

  const handleInputChange = (category, field, value) => {
    switch(category) {
      case 'general':
        setGeneralSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecuritySettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotificationSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'users':
        setUserSettings(prev => ({ ...prev, [field]: value }));
        break;
      case 'system':
        setSystemSettings(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={generalSettings.companyName}
            onChange={(e) => handleInputChange('general', 'companyName', e.target.value)}
            className="input-field"
            placeholder="Enter company name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={generalSettings.timezone}
            onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
            className="input-field"
          >
            <option value="UTC+05:30">India (UTC+05:30)</option>
            <option value="UTC-05:00">Eastern Time (UTC-05:00)</option>
            <option value="UTC+00:00">GMT (UTC+00:00)</option>
            <option value="UTC+08:00">Singapore (UTC+08:00)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={generalSettings.dateFormat}
            onChange={(e) => handleInputChange('general', 'dateFormat', e.target.value)}
            className="input-field"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Format
          </label>
          <select
            value={generalSettings.timeFormat}
            onChange={(e) => handleInputChange('general', 'timeFormat', e.target.value)}
            className="input-field"
          >
            <option value="24-hour">24-hour</option>
            <option value="12-hour">12-hour</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Week Starts On
          </label>
          <select
            value={generalSettings.weekStart}
            onChange={(e) => handleInputChange('general', 'weekStart', e.target.value)}
            className="input-field"
          >
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Shift Hours
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={generalSettings.minShiftHours}
            onChange={(e) => handleInputChange('general', 'minShiftHours', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enable Auto Scheduling
            </label>
            <p className="text-xs text-gray-500">Automatically generate schedules based on rules</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={generalSettings.allowAutoSchedule}
              onChange={(e) => handleInputChange('general', 'allowAutoSchedule', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enable Notifications
            </label>
            <p className="text-xs text-gray-500">Send system notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={generalSettings.enableNotifications}
              onChange={(e) => handleInputChange('general', 'enableNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Password Length
          </label>
          <input
            type="number"
            min="6"
            max="32"
            value={securitySettings.passwordMinLength}
            onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="240"
            value={securitySettings.sessionTimeout}
            onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={securitySettings.maxLoginAttempts}
            onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Require Special Characters in Password
            </label>
            <p className="text-xs text-gray-500">e.g., @#$%^&*</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securitySettings.requireSpecialChars}
              onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Require Numbers in Password
            </label>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securitySettings.requireNumbers}
              onChange={(e) => handleInputChange('security', 'requireNumbers', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enable Two-Factor Authentication
            </label>
            <p className="text-xs text-gray-500">Add extra security layer</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securitySettings.enable2FA}
              onChange={(e) => handleInputChange('security', 'enable2FA', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <p className="text-xs text-gray-500">
                {getNotificationDescription(key)}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const getNotificationDescription = (key) => {
    const descriptions = {
      emailNotifications: 'Send email notifications',
      pushNotifications: 'Send push notifications',
      shiftChangeAlerts: 'Alert on shift changes',
      attendanceAlerts: 'Alert on attendance issues',
      overtimeAlerts: 'Alert on overtime',
      scheduleReminders: 'Send schedule reminders',
      dailyReports: 'Send daily reports',
      weeklyReports: 'Send weekly reports',
    };
    return descriptions[key] || '';
  };

  const renderUserManagementSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default User Role
          </label>
          <select
            value={userSettings.defaultRole}
            onChange={(e) => handleInputChange('users', 'defaultRole', e.target.value)}
            className="input-field"
          >
            <option value="employee">Employee</option>
            <option value="department_manager">Department Manager</option>
            <option value="division_manager">Division Manager</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Employees per Department
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={userSettings.maxEmployeesPerDept}
            onChange={(e) => handleInputChange('users', 'maxEmployeesPerDept', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Allow Self Registration
            </label>
            <p className="text-xs text-gray-500">Users can create their own accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.allowSelfRegistration}
              onChange={(e) => handleInputChange('users', 'allowSelfRegistration', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Require Approval for New Users
            </label>
            <p className="text-xs text-gray-500">Admin must approve new registrations</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.requireApproval}
              onChange={(e) => handleInputChange('users', 'requireApproval', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Auto-assign Division
            </label>
            <p className="text-xs text-gray-500">Automatically assign users to divisions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.autoAssignDivision}
              onChange={(e) => handleInputChange('users', 'autoAssignDivision', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Allow Profile Updates
            </label>
            <p className="text-xs text-gray-500">Users can update their profiles</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={userSettings.allowProfileUpdates}
              onChange={(e) => handleInputChange('users', 'allowProfileUpdates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <select
            value={systemSettings.backupFrequency}
            onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
            className="input-field"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Time
          </label>
          <input
            type="time"
            value={systemSettings.backupTime}
            onChange={(e) => handleInputChange('system', 'backupTime', e.target.value)}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keep Backups For (days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={systemSettings.keepBackupsFor}
            onChange={(e) => handleInputChange('system', 'keepBackupsFor', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Log Retention (days)
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={systemSettings.logRetention}
            onChange={(e) => handleInputChange('system', 'logRetention', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Rate Limit (requests/min)
          </label>
          <input
            type="number"
            min="10"
            max="1000"
            value={systemSettings.apiRateLimit}
            onChange={(e) => handleInputChange('system', 'apiRateLimit', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Maintenance Mode
            </label>
            <p className="text-xs text-gray-500">Take system offline for maintenance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={systemSettings.maintenanceMode}
              onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enable Audit Log
            </label>
            <p className="text-xs text-gray-500">Log all system activities</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={systemSettings.enableAuditLog}
              onChange={(e) => handleInputChange('system', 'enableAuditLog', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'users':
        return renderUserManagementSettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Admin Settings</h3>
            <p className="text-gray-600">Configure system settings</p>
          </div>
        </div>
        <div className="card p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Admin Settings</h3>
          <p className="text-gray-600">Configure system settings</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={resetSettings}
            className="btn-secondary flex items-center space-x-2"
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={saveSettings}
            className="btn-primary flex items-center space-x-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`card p-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' :
          message.type === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : message.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <Info className="w-5 h-5 text-blue-600" />
            )}
            <span className={
              message.type === 'success' ? 'text-green-700' :
              message.type === 'error' ? 'text-red-700' :
              'text-blue-700'
            }>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="card p-6">
        {renderContent()}
      </div>

      {/* Advanced Actions */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Advanced Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-800 mb-1">Clear Cache</div>
            <p className="text-sm text-gray-600">Clear system cache</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-800 mb-1">Run Backup</div>
            <p className="text-sm text-gray-600">Manual backup now</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <div className="font-medium text-gray-800 mb-1">System Logs</div>
            <p className="text-sm text-gray-600">View system logs</p>
          </button>
          
          <button className="p-4 border border-red-200 rounded-lg hover:bg-red-50 text-left">
            <div className="font-medium text-red-800 mb-1">Purge Data</div>
            <p className="text-sm text-red-600">Delete old data (careful)</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Add missing icon components
const CheckCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Info = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default AdminSettings;