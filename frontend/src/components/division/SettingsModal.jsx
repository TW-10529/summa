import React, { useState, useEffect } from 'react';
import { X, Save, Bell, Shield, Globe, User, Lock, Palette } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [settings, setSettings] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profile = await settingsService.getDivisionProfile();
      setProfileData({
        full_name: profile.user.full_name || '',
        email: profile.user.email || '',
        avatar_url: profile.user.avatar_url || ''
      });
      
      // Load settings
      const settingsData = await settingsService.getSettings();
      setSettings(settingsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await settingsService.updateDivisionProfile(profileData);
      
      // Update auth context
      updateUser({
        full_name: profileData.full_name,
        email: profileData.email,
        avatar_url: profileData.avatar_url
      });
      
      setMessage({ type: 'success', text: response.message });
      
      // Refresh after 2 seconds
      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const response = await settingsService.changePassword(passwordData);
      
      setMessage({ type: 'success', text: response.message });
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    
    // Auto-save setting
    settingsService.updateSetting(category, key, value);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Settings</h3>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Message */}
                {message.text && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {message.text}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800">Profile Settings</h4>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <img
                          src={profileData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full border-4 border-white shadow"
                        />
                        <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full">
                          <User className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800">{profileData.full_name || user?.full_name}</h5>
                        <p className="text-gray-600">{user?.role?.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">{profileData.email || user?.email}</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                          <input
                            type="text"
                            value={profileData.avatar_url}
                            onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})}
                            className="input-field"
                            placeholder="https://example.com/avatar.jpg"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800">Security Settings</h4>
                    
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                          <input
                            type="password"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <input
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                            className="input-field"
                            required
                            minLength={8}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                            className="input-field"
                            required
                            minLength={8}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Change Password</span>
                        </button>
                      </div>
                    </form>

                    <div className="pt-6 border-t border-gray-200">
                      <h5 className="font-semibold text-gray-800 mb-3">Session Management</h5>
                      <button className="w-full btn-secondary">
                        Logout from All Devices
                      </button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800">Notification Settings</h4>
                    
                    <div className="space-y-4">
                      {settings.notifications && Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-600">
                              {key === 'email_enabled' ? 'Receive email notifications' :
                               key === 'push_enabled' ? 'Receive push notifications' :
                               key === 'daily_report' ? 'Get daily reports' :
                               key === 'attendance_alerts' ? 'Alert when attendance drops' :
                               'Notify about shift changes'}
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
                )}

                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800">General Settings</h4>
                    
                    <div className="space-y-4">
                      {settings.general && Object.entries(settings.general).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                          {key === 'timezone' ? (
                            <select
                              value={value}
                              onChange={(e) => handleSettingChange('general', key, e.target.value)}
                              className="input-field"
                            >
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                            </select>
                          ) : key === 'language' ? (
                            <select
                              value={value}
                              onChange={(e) => handleSettingChange('general', key, e.target.value)}
                              className="input-field"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleSettingChange('general', key, e.target.value)}
                              className="input-field"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-gray-800">Appearance Settings</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-4">
                        {['light', 'dark', 'auto'].map((theme) => (
                          <button
                            key={theme}
                            className={`p-4 border rounded-lg text-center ${
                              settings.theme === theme ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                            onClick={() => handleSettingChange('appearance', 'theme', theme)}
                          >
                            <div className={`w-8 h-8 mx-auto mb-2 rounded-full ${
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
                      <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
                      <div className="flex space-x-3">
                        {['blue', 'green', 'purple', 'orange'].map((color) => (
                          <button
                            key={color}
                            className={`w-10 h-10 rounded-full border-2 ${
                              settings.color === color ? 'border-gray-800' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: `var(--color-${color}-500)` }}
                            onClick={() => handleSettingChange('appearance', 'color', color)}
                          ></button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;