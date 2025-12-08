import React, { useState } from 'react';
import { Save, Bell, Shield, Database, Mail, Key, RefreshCw } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    systemAlerts: true,
    autoBackup: false,
    twoFactorAuth: false,
    auditLogging: true,
    darkMode: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: '587',
    senderEmail: 'noreply@factoryshift.com',
    smtpUsername: '',
    smtpPassword: '',
  });

  const handleSettingChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleEmailSettingChange = (key, value) => {
    setEmailSettings({ ...emailSettings, [key]: value });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('factory_settings', JSON.stringify(settings));
    localStorage.setItem('factory_email_settings', JSON.stringify(emailSettings));
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        emailNotifications: true,
        systemAlerts: true,
        autoBackup: false,
        twoFactorAuth: false,
        auditLogging: true,
        darkMode: false,
      };
      setSettings(defaultSettings);
      alert('Settings reset to default!');
    }
  };

  const handleTestEmail = () => {
    alert('Test email would be sent to configured email address');
  };

  const handleBackupNow = () => {
    alert('Backup process initiated...');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all audit logs?')) {
      alert('Audit logs cleared!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">Admin Settings</h3>
        <p className="text-gray-600">Configure system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-800">Notification Settings</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">System Alerts</p>
                <p className="text-sm text-gray-500">Show system alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.systemAlerts}
                  onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Audit Logging</p>
                <p className="text-sm text-gray-500">Log system activities</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auditLogging}
                  onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-800">Security Settings</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Enable 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Auto Session Timeout</p>
                <p className="text-sm text-gray-500">30 minutes</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Password Policy</p>
                <p className="text-sm text-gray-500">Minimum 8 characters</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-800">Email Configuration</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
              <input
                type="text"
                value={emailSettings.smtpServer}
                onChange={(e) => handleEmailSettingChange('smtpServer', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <input
                type="text"
                value={emailSettings.smtpPort}
                onChange={(e) => handleEmailSettingChange('smtpPort', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
              <input
                type="email"
                value={emailSettings.senderEmail}
                onChange={(e) => handleEmailSettingChange('senderEmail', e.target.value)}
                className="input-field"
              />
            </div>
            <button
              onClick={handleTestEmail}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Test Email Configuration</span>
            </button>
          </div>
        </div>

        {/* Backup & Maintenance */}
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-gray-800">Backup & Maintenance</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Auto Backup</p>
                <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <button
              onClick={handleBackupNow}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Database className="w-4 h-4" />
              <span>Backup Now</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Clear Audit Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={handleResetSettings}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={handleSaveSettings}
            className="btn-primary flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-2 border-red-200">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="w-5 h-5 text-red-600" />
          <h4 className="font-semibold text-gray-800">Danger Zone</h4>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => alert('This would delete all data!')}
              className="btn-danger"
            >
              Delete All Data
            </button>
            <button
              onClick={() => alert('This would reset the entire system!')}
              className="btn-danger"
            >
              Factory Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;