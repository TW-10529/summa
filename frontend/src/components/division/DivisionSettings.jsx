
import React, { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, Bell, Clock, Users, 
  CheckCircle, Shield, Globe, AlertCircle, Database,
  User, Mail, Lock, Palette, Building2, Layers
} from 'lucide-react';
import { divisionManagerService } from '../../services/divisionManagerService';
import { useAuth } from '../../contexts/AuthContext';

const DivisionSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile Settings
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: ''
  });
  
  // Division Settings
  const [divisionSettings, setDivisionSettings] = useState({
    general: {
      timezone: 'UTC+05:30',
      shift_overlap_minutes: 15,
      max_overtime_hours: 12,
      default_shift_duration: 8,
      early_clock_in_minutes: 15,
      late_clock_in_minutes: 10,
      break_duration: 60
    },
    notifications: {
      attendance_alerts: true,
      schedule_changes: true,
      overtime_approvals: true,
      daily_summary: false,
      weekly_report: true,
      monthly_report: true,
      shift_reminders: true,
      holiday_notifications: true
    },
    security: {
      session_timeout: 30,
      require_password_change: false,
      password_expiry_days: 90,
      login_attempts: 5,
      lockout_duration: 30
    },
    appearance: {
      theme: 'light',
      language: 'en',
      date_format: 'dd/MM/yyyy',
      time_format: '24h',
      show_weekends: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch division settings
      const settings = await divisionManagerService.getDivisionSettings();
      if (settings) {
        setDivisionSettings(prev => ({
          ...prev,
          ...settings,
          general: { ...prev.general, ...settings.general },
          notifications: { ...prev.notifications, ...settings.notifications }
        }));
      }
      
      // Set user profile
      setProfile({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department_name || ''
      });
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setDivisionSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleProfileChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      // Save each setting category
      for (const category in divisionSettings) {
        for (const key in divisionSettings[category]) {
          await divisionManagerService.updateDivisionSetting(
            category,
            key,
            divisionSettings[category][key]
          );
        }
      }
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setDivisionSettings({
        general: {
          timezone: 'UTC+05:30',
          shift_overlap_minutes: 15,
          max_overtime_hours: 12,
          default_shift_duration: 8,
          early_clock_in_minutes: 15,
          late_clock_in_minutes: 10,
          break_duration: 60
        },
        notifications: {
          attendance_alerts: true,
          schedule_changes: true,
          overtime_approvals: true,
          daily_summary: false,
          weekly_report: true,
          monthly_report: true,
          shift_reminders: true,
          holiday_notifications: true
        },
        security: {
          session_timeout: 30,
          require_password_change: false,
          password_expiry_days: 90,
          login_attempts: 5,
          lockout_duration: 30
        },
        appearance: {
          theme: 'light',
          language: 'en',
          date_format: 'dd/MM/yyyy',
          time_format: '24h',
          show_weekends: true
        }
      });
      
      setMessage({ type: 'info', text: 'Settings reset to default values' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Division Settings</h3>
            <p className="text-gray-600">Configure your division preferences</p>
          </div>
        </div>
        <div className="card p-12 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Division Settings</h3>
          <p className="text-gray-600">Configure your division preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={resetToDefaults}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`card p-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' :
          message.type === 'error' ? 'bg-red-50 border-red-200' :
          message.type === 'info' ? 'bg-blue-50 border-blue-200' :
          'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : message.type === 'info' ? (
              <Bell className="w-5 h-5 text-blue-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            )}
            <span className={
              message.type === 'success' ? 'text-green-700' :
              message.type === 'error' ? 'text-red-700' :
              message.type === 'info' ? 'text-blue-700' :
              'text-yellow-700'
            }>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-500" />
          <span>Profile Information</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => handleProfileChange('full_name', e.target.value)}
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                className="input-field pl-10"
                placeholder="your.email@company.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="input-field"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => handleProfileChange('department', e.target.value)}
              className="input-field"
              placeholder="Your department"
              disabled
            />
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5 text-green-500" />
          <span>General Settings</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={divisionSettings.general.timezone}
                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                className="input-field"
              >
                <option value="UTC">UTC</option>
                <option value="UTC+05:30">IST (UTC+05:30)</option>
                <option value="UTC-05:00">EST (UTC-05:00)</option>
                <option value="UTC+01:00">CET (UTC+01:00)</option>
                <option value="UTC+08:00">CST (UTC+08:00)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift Overlap Minutes
              </label>
              <input
                type="number"
                value={divisionSettings.general.shift_overlap_minutes}
                onChange={(e) => handleSettingChange('general', 'shift_overlap_minutes', parseInt(e.target.value) || 0)}
                className="input-field"
                min="0"
                max="60"
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowable overlap between consecutive shifts
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Overtime Hours (per week)
              </label>
              <input
                type="number"
                value={divisionSettings.general.max_overtime_hours}
                onChange={(e) => handleSettingChange('general', 'max_overtime_hours', parseInt(e.target.value) || 0)}
                className="input-field"
                min="0"
                max="20"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Shift Duration (hours)
              </label>
              <input
                type="number"
                value={divisionSettings.general.default_shift_duration}
                onChange={(e) => handleSettingChange('general', 'default_shift_duration', parseInt(e.target.value) || 8)}
                className="input-field"
                min="4"
                max="12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                value={divisionSettings.general.break_duration}
                onChange={(e) => handleSettingChange('general', 'break_duration', parseInt(e.target.value) || 60)}
                className="input-field"
                min="15"
                max="120"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Clock-in Tolerance (minutes)
              </label>
              <input
                type="number"
                value={divisionSettings.general.late_clock_in_minutes}
                onChange={(e) => handleSettingChange('general', 'late_clock_in_minutes', parseInt(e.target.value) || 10)}
                className="input-field"
                min="0"
                max="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Grace period before marking as late
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Bell className="w-5 h-5 text-orange-500" />
          <span>Notification Settings</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(divisionSettings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <p className="font-medium text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {key === 'attendance_alerts' && 'Receive alerts for attendance issues'}
                  {key === 'schedule_changes' && 'Notify about schedule changes'}
                  {key === 'overtime_approvals' && 'Get notified for overtime requests'}
                  {key === 'daily_summary' && 'Receive daily attendance summary'}
                  {key === 'weekly_report' && 'Get weekly division report'}
                  {key === 'monthly_report' && 'Get monthly performance report'}
                  {key === 'shift_reminders' && 'Receive shift reminders'}
                  {key === 'holiday_notifications' && 'Get holiday notifications'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-purple-500" />
          <span>Security Settings</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <select
                value={divisionSettings.security.session_timeout}
                onChange={(e) => handleSettingChange('security', 'session_timeout', parseInt(e.target.value))}
                className="input-field"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="0">Never</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Expiry (days)
              </label>
              <input
                type="number"
                value={divisionSettings.security.password_expiry_days}
                onChange={(e) => handleSettingChange('security', 'password_expiry_days', parseInt(e.target.value) || 90)}
                className="input-field"
                min="30"
                max="365"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={divisionSettings.security.login_attempts}
                onChange={(e) => handleSettingChange('security', 'login_attempts', parseInt(e.target.value) || 5)}
                className="input-field"
                min="3"
                max="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Lockout Duration (minutes)
              </label>
              <input
                type="number"
                value={divisionSettings.security.lockout_duration}
                onChange={(e) => handleSettingChange('security', 'lockout_duration', parseInt(e.target.value) || 30)}
                className="input-field"
                min="15"
                max="1440"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">Require Password Change</p>
              <p className="text-sm text-gray-500">Force password change on next login</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={divisionSettings.security.require_password_change}
                onChange={(e) => handleSettingChange('security', 'require_password_change', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Palette className="w-5 h-5 text-pink-500" />
          <span>Appearance Settings</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Theme
              </label>
              <div className="flex space-x-3">
                {['light', 'dark', 'auto'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleSettingChange('appearance', 'theme', theme)}
                    className={`flex flex-col items-center p-3 border rounded-lg ${
                      divisionSettings.appearance.theme === theme 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mb-2 ${
                      theme === 'light' ? 'bg-yellow-100' :
                      theme === 'dark' ? 'bg-gray-800' :
                      'bg-gradient-to-r from-gray-800 to-yellow-100'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{theme}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={divisionSettings.appearance.language}
                onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                value={divisionSettings.appearance.date_format}
                onChange={(e) => handleSettingChange('appearance', 'date_format', e.target.value)}
                className="input-field"
              >
                <option value="dd/MM/yyyy">DD/MM/YYYY (31/12/2024)</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY (12/31/2024)</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD (2024-12-31)</option>
                <option value="dd-MMM-yyyy">DD-MMM-YYYY (31-Dec-2024)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Format
              </label>
              <select
                value={divisionSettings.appearance.time_format}
                onChange={(e) => handleSettingChange('appearance', 'time_format', e.target.value)}
                className="input-field"
              >
                <option value="24h">24-hour (14:30)</option>
                <option value="12h">12-hour (2:30 PM)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-700">Show Weekends in Calendar</p>
                <p className="text-sm text-gray-500">Display Saturday and Sunday in schedule views</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={divisionSettings.appearance.show_weekends}
                  onChange={(e) => handleSettingChange('appearance', 'show_weekends', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-500" />
          <span>System Information</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Division</p>
                <p className="font-medium text-gray-800">{user?.division_name || 'Not assigned'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-800 capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Employee ID</p>
                <p className="font-medium text-gray-800">{user?.employee_id || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-medium text-gray-800">
                  {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivisionSettings;
