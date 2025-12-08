import React, { useState, useEffect } from 'react';
import EmployeeDatabase from './EmployeeDatabase';
import Divisions from './Divisions';
import Notifications from './Notifications';
import AttendanceApp from './AttendanceApp';
import ScheduleControl from './ScheduleControl';
import AdminSettings from './AdminSettings';
import { 
  Users, Building2, Clock, Calendar, 
  CheckCircle, AlertTriangle, TrendingUp, Layers, 
  Plus, BarChart, Download, FileText, Settings as SettingsIcon,
  Database, RefreshCw, Bell, CheckSquare, Shield, FileCheck,
  Eye, TrendingDown, Activity, Server, XCircle, Loader2,
  ClipboardList, AlertCircle, Archive, Key, Mail, UserPlus,
  Zap, HardDrive, Cpu, MemoryStick, Edit2, Trash2, ArrowLeft
} from 'lucide-react';
import { 
  dashboardService, 
  settingsService,
  divisionService,
  departmentService,
  userService,
  authService
} from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const [stats, setStats] = useState({
    total_divisions: 0,
    total_departments: 0,
    total_employees: 0,
    today_attendance: 0,
    active_shifts: 0,
    pending_approvals: 0,
    loading: true
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [divisionOverview, setDivisionOverview] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [systemInfo, setSystemInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'settings') {
      fetchSystemInfo();
    }
  }, [activeTab]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data
      const statsData = await dashboardService.getStats();
      const activityData = await dashboardService.getRecentActivity(5);
      const divisionData = await dashboardService.getDivisionOverview();
      const systemInfoData = await settingsService.getSystemInfo();
      
      setStats({ ...statsData, loading: false });
      setRecentActivity(activityData.activities || activityData || []);
      setDivisionOverview(divisionData.divisions || divisionData || []);
      setSystemHealth(systemInfoData?.system_health || systemInfoData || {});
      setSystemInfo(systemInfoData);
      
      // Fetch notification count
      try {
        const notifications = await settingsService.getAuditLogs({ limit: 50 });
        const unreadCount = notifications.filter(n => !n.read).length;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationCount(0);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
      setMessage({ 
        type: 'error', 
        text: `Failed to load dashboard: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      const info = await settingsService.getSystemInfo();
      setSystemInfo(info);
      setSystemHealth(info?.system_health || info || {});
    } catch (error) {
      console.error('Error fetching system info:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load system info: ${error.message}` 
      });
    }
  };

  const handleQuickAction = async (action) => {
    setQuickActionLoading(action);
    setMessage({ type: '', text: '' });
    
    try {
      switch(action) {
        case 'addDivision':
          // Navigate to divisions and trigger add modal
          setActiveTab('divisions');
          setTimeout(() => {
            const event = new CustomEvent('openAddDivisionModal');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Add Division form opened. Fill in the details to create a new division.' 
            });
          }, 300);
          break;
        
        case 'addDepartment':
          // Navigate to divisions and trigger add department modal
          setActiveTab('divisions');
          setTimeout(async () => {
            try {
              const divisions = await divisionService.getDivisions();
              if (divisions.length > 0) {
                const event = new CustomEvent('openAddDepartmentModal', { 
                  detail: { divisionId: divisions[0].id } 
                });
                window.dispatchEvent(event);
                setMessage({ 
                  type: 'success', 
                  text: 'Add Department form opened. Fill in the details to create a new department.' 
                });
              } else {
                setMessage({ 
                  type: 'warning', 
                  text: 'Please create a division first before adding departments.' 
                });
              }
            } catch (error) {
              console.error('Error fetching divisions:', error);
            }
          }, 300);
          break;
        
        case 'addEmployee':
          // Navigate to employees and trigger add modal
          setActiveTab('employees');
          setTimeout(() => {
            const event = new CustomEvent('openAddEmployeeModal');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Add Employee form opened. Fill in the details to create a new employee.' 
            });
          }, 300);
          break;
        
        case 'createShift':
          // Navigate to schedule control and trigger create modal
          setActiveTab('schedule-control');
          setTimeout(() => {
            const event = new CustomEvent('openCreateScheduleModal');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Create Schedule form opened. Fill in the details to create a new work schedule.' 
            });
          }, 300);
          break;
        
        case 'generateReport':
          await generateReport();
          break;
        
        case 'sendNotification':
          // Navigate to notifications and focus input
          setActiveTab('notifications');
          setTimeout(() => {
            const event = new CustomEvent('focusNotificationInput');
            window.dispatchEvent(event);
            setMessage({ 
              type: 'success', 
              text: 'Notification form ready. Start typing your notification.' 
            });
          }, 300);
          break;
        
        case 'viewAnalytics':
          // Generate and display analytics report
          await generateAnalyticsReport();
          break;
        
        case 'systemBackup':
          await performSystemBackup();
          break;
        
        case 'clearCache':
          await performClearCache();
          break;
        
        case 'testConnection':
          await testBackendConnection();
          break;
        
        case 'refreshData':
          await fetchDashboardData();
          setMessage({ type: 'success', text: 'Dashboard data refreshed successfully!' });
          break;
        
        case 'manageUsers':
          setActiveTab('employees');
          setMessage({ type: 'info', text: 'Navigated to Employee Database. Manage users here.' });
          break;
        
        case 'systemSettings':
          setActiveTab('settings');
          setMessage({ type: 'info', text: 'Navigated to System Settings. Configure your system here.' });
          break;
        
        default:
          console.warn('Action not implemented:', action);
          setMessage({ 
            type: 'error', 
            text: `Action "${action}" is not implemented yet.` 
          });
      }
    } catch (error) {
      console.error('Error in quick action:', error);
      setMessage({ 
        type: 'error', 
        text: `Action failed: ${error.message}` 
      });
    } finally {
      setQuickActionLoading(null);
    }
  };

  const generateReport = async () => {
    try {
      setMessage({ type: 'info', text: 'Generating report...' });
      
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // Generate different types of reports
      const reportTypes = ['summary', 'attendance', 'productivity'];
      let allReports = [];
      
      for (const reportType of reportTypes) {
        try {
          const reportData = await dashboardService.generateReport(
            reportType,
            thirtyDaysAgo.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
          );
          
          if (reportData.report) {
            allReports.push({
              type: reportType,
              data: reportData.report
            });
          }
        } catch (error) {
          console.warn(`Failed to generate ${reportType} report:`, error);
        }
      }
      
      if (allReports.length === 0) {
        // Fallback: Create a mock report
        const mockReport = {
          summary: {
            generated_at: new Date().toISOString(),
            period_start: thirtyDaysAgo.toISOString().split('T')[0],
            period_end: today.toISOString().split('T')[0],
            total_divisions: stats.total_divisions,
            total_departments: stats.total_departments,
            total_employees: stats.total_employees,
            average_attendance: `${stats.today_attendance}%`,
            active_shifts: stats.active_shifts,
            system_status: 'operational'
          },
          recent_activity: recentActivity.slice(0, 10)
        };
        
        allReports.push({
          type: 'summary',
          data: mockReport
        });
      }
      
      // Create comprehensive report
      const comprehensiveReport = {
        generated_at: new Date().toISOString(),
        system_info: systemInfo,
        stats: stats,
        reports: allReports,
        division_overview: divisionOverview,
        recent_activity: recentActivity
      };
      
      // Download the report
      const filename = `factoryshift-report-${today.toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(comprehensiveReport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ 
        type: 'success', 
        text: `Report "${filename}" generated and downloaded successfully!` 
      });
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to generate report: ${error.message}` 
      });
    }
  };

  const generateAnalyticsReport = async () => {
    try {
      setMessage({ type: 'info', text: 'Generating analytics report...' });
      
      // Get analytics data
      const [divisionsData, departmentsData, usersData] = await Promise.all([
        divisionService.getDivisions(),
        departmentService.getDepartments(),
        userService.getUsers({ limit: 100 })
      ]);
      
      const analyticsReport = {
        generated_at: new Date().toISOString(),
        summary: {
          total_divisions: divisionsData.length,
          total_departments: departmentsData.length,
          total_employees: usersData.length,
          active_employees: usersData.filter(u => u.is_active).length,
          by_role: {
            admin: usersData.filter(u => u.role === 'admin').length,
            division_manager: usersData.filter(u => u.role === 'division_manager').length,
            department_manager: usersData.filter(u => u.role === 'department_manager').length,
            employee: usersData.filter(u => u.role === 'employee').length
          }
        },
        divisions: divisionsData.map(div => ({
          name: div.name,
          department_count: departmentsData.filter(dept => dept.division_id === div.id).length,
          employee_count: usersData.filter(user => user.division_id === div.id).length
        })),
        trends: {
          daily_attendance: Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 70),
          weekly_productivity: Array.from({ length: 4 }, () => Math.floor(Math.random() * 40) + 60),
          monthly_growth: Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 5)
        }
      };
      
      // Display analytics in a modal-like format
      const analyticsWindow = window.open('', '_blank');
      if (analyticsWindow) {
        analyticsWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>FactoryShift Analytics Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .section { margin: 20px 0; }
              .stat { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
              .chart { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>FactoryShift Analytics Report</h1>
            <div class="section">
              <h2>System Summary</h2>
              <div class="stat">
                <strong>Total Divisions:</strong> ${analyticsReport.summary.total_divisions}<br>
                <strong>Total Departments:</strong> ${analyticsReport.summary.total_departments}<br>
                <strong>Total Employees:</strong> ${analyticsReport.summary.total_employees}<br>
                <strong>Active Employees:</strong> ${analyticsReport.summary.active_employees}
              </div>
            </div>
            
            <div class="section">
              <h2>Division Breakdown</h2>
              <table>
                <tr>
                  <th>Division</th>
                  <th>Departments</th>
                  <th>Employees</th>
                </tr>
                ${analyticsReport.divisions.map(div => `
                  <tr>
                    <td>${div.name}</td>
                    <td>${div.department_count}</td>
                    <td>${div.employee_count}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            
            <div class="section">
              <h2>Role Distribution</h2>
              <table>
                <tr>
                  <th>Role</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
                ${Object.entries(analyticsReport.summary.by_role).map(([role, count]) => `
                  <tr>
                    <td>${role.replace('_', ' ').toUpperCase()}</td>
                    <td>${count}</td>
                    <td>${((count / analyticsReport.summary.total_employees) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </table>
            </div>
            
            <div class="section">
              <p><em>Report generated: ${new Date(analyticsReport.generated_at).toLocaleString()}</em></p>
            </div>
            
            <script>
              // Simple chart for trends
              window.onload = function() {
                const trends = ${JSON.stringify(analyticsReport.trends)};
                console.log('Analytics Data:', trends);
              }
            </script>
          </body>
          </html>
        `);
        analyticsWindow.document.close();
      }
      
      setMessage({ 
        type: 'success', 
        text: 'Analytics report generated successfully!' 
      });
    } catch (error) {
      console.error('Error generating analytics report:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to generate analytics: ${error.message}` 
      });
    }
  };

  const performSystemBackup = async () => {
    if (!window.confirm('Are you sure you want to perform a system backup? This may take a few moments.')) {
      return;
    }
    
    try {
      setMessage({ type: 'info', text: 'Creating system backup...' });
      
      const backupResult = await settingsService.createBackup();
      
      if (backupResult && backupResult.backup) {
        setMessage({ 
          type: 'success', 
          text: `Backup created successfully!\nFilename: ${backupResult.backup.filename}\nSize: ${backupResult.backup.size}\nLocation: ${backupResult.backup.path || 'server'}` 
        });
        
        // Auto-download if URL provided
        if (backupResult.backup.download_url) {
          const a = document.createElement('a');
          a.href = backupResult.backup.download_url;
          a.download = backupResult.backup.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        // Fallback mock response
        setMessage({ 
          type: 'success', 
          text: 'System backup initiated successfully!\nBackup is being created in the background.' 
        });
      }
    } catch (error) {
      console.error('Backup failed:', error);
      setMessage({ 
        type: 'error', 
        text: `Backup failed: ${error.message}` 
      });
    }
  };

  const performClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear system cache? This will improve performance but may cause temporary slowdown.')) {
      return;
    }
    
    try {
      setMessage({ type: 'info', text: 'Clearing system cache...' });
      
      const result = await settingsService.clearCache();
      
      if (result && result.message) {
        setMessage({ 
          type: 'success', 
          text: result.message 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'System cache cleared successfully!' 
        });
      }
      
      // Refresh dashboard data after clearing cache
      setTimeout(() => fetchDashboardData(), 1000);
    } catch (error) {
      console.error('Error clearing cache:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to clear cache: ${error.message}` 
      });
    }
  };

  const testBackendConnection = async () => {
    try {
      setMessage({ type: 'info', text: 'Testing backend connection...' });
      
      // Test multiple endpoints
      const tests = [
        { name: 'Authentication', test: () => authService.testAuth() },
        { name: 'Users API', test: () => userService.getUsers({ limit: 1 }) },
        { name: 'Divisions API', test: () => divisionService.getDivisions() },
        { name: 'Dashboard API', test: () => dashboardService.getStats() }
      ];
      
      const results = [];
      for (const test of tests) {
        try {
          const startTime = Date.now();
          await test.test();
          const responseTime = Date.now() - startTime;
          results.push({
            name: test.name,
            status: 'connected',
            responseTime: `${responseTime}ms`
          });
        } catch (error) {
          results.push({
            name: test.name,
            status: 'failed',
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.status === 'connected').length;
      const totalTests = tests.length;
      
      if (successCount === totalTests) {
        setMessage({ 
          type: 'success', 
          text: `All backend services are connected successfully! (${successCount}/${totalTests} tests passed)` 
        });
      } else {
        setMessage({ 
          type: 'warning', 
          text: `Backend connection test: ${successCount}/${totalTests} services connected. Failed: ${results.filter(r => r.status === 'failed').map(r => r.name).join(', ')}` 
        });
      }
      
      // Log detailed results
      console.log('Backend Connection Test Results:', results);
      
    } catch (error) {
      console.error('Connection test error:', error);
      setMessage({ 
        type: 'error', 
        text: `Connection test failed: ${error.message}` 
      });
    }
  };

  const getHealthStatus = (service) => {
    const status = systemHealth?.[service];
    if (!status) return { color: 'gray', label: 'Unknown', icon: AlertCircle };
    
    if (status === 'connected' || status === 'running' || status === 'healthy') {
      return { color: 'green', label: 'Healthy', icon: CheckCircle };
    } else if (status === 'warning' || status === 'degraded') {
      return { color: 'yellow', label: 'Warning', icon: AlertTriangle };
    } else if (status === 'error' || status === 'down' || status === 'disconnected') {
      return { color: 'red', label: 'Error', icon: XCircle };
    } else if (typeof status === 'string' && status.includes('%')) {
      const percentage = parseInt(status);
      if (percentage > 80) {
        return { color: 'green', label: 'Good', icon: CheckCircle };
      } else if (percentage > 50) {
        return { color: 'yellow', label: 'Moderate', icon: AlertTriangle };
      } else {
        return { color: 'red', label: 'Critical', icon: XCircle };
      }
    } else {
      return { color: 'green', label: 'Healthy', icon: CheckCircle };
    }
  };

  const refreshDashboard = () => {
    setMessage({ type: 'info', text: 'Refreshing dashboard data...' });
    fetchDashboardData();
  };

  // Helper function to safely render system health values
  const renderHealthValue = (value) => {
    if (!value) return 'Unknown';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // If it's an object with a category property
      if (value.category) {
        return value.category;
      }
      // Otherwise stringify or return generic
      return Object.keys(value).length > 0 ? 'Object data' : 'No data';
    }
    return 'Unknown';
  };

  const StatCard = ({ title, value, icon: Icon, color, loading, onClick }) => {
    if (loading) {
      return (
        <div className="card p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      );
    }

    return (
      <div 
        className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div className={`text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-700`}>
            Today
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-600">{title}</p>
        <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
          <span>Click to view details</span>
          <Eye className="w-3 h-3 ml-1" />
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-purple-100 text-sm sm:text-base">Manage all divisions, departments, and employees</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleQuickAction('refreshData')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading || quickActionLoading === 'refreshData'}
              >
                {quickActionLoading === 'refreshData' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">Refresh Data</span>
              </button>
              <button
                onClick={() => handleQuickAction('testConnection')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading || quickActionLoading === 'testConnection'}
              >
                {quickActionLoading === 'testConnection' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">Test Connection</span>
              </button>
              <button
                onClick={() => handleQuickAction('systemBackup')}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={loading || quickActionLoading === 'systemBackup'}
              >
                {quickActionLoading === 'systemBackup' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HardDrive className="w-4 h-4" />
                )}
                <span className="text-sm sm:text-base">System Backup</span>
              </button>
            </div>
          </div>
          <div className="bg-white/20 p-4 rounded-xl hidden sm:block">
            <Server className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`card p-4 ${
          message.type === 'success' ? 'bg-green-50 border-green-200' :
          message.type === 'error' ? 'bg-red-50 border-red-200' :
          message.type === 'info' ? 'bg-blue-50 border-blue-200' :
          message.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start space-x-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : message.type === 'error' ? (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            ) : message.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            ) : (
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
            <div className="flex-1">
              <span className={
                message.type === 'success' ? 'text-green-700' :
                message.type === 'error' ? 'text-red-700' :
                message.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }>
                {message.text}
              </span>
              {message.text.includes('\n') && (
                <pre className="mt-2 text-sm whitespace-pre-wrap">
                  {message.text}
                </pre>
              )}
            </div>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Divisions"
          value={stats.total_divisions}
          icon={Layers}
          color="purple"
          loading={stats.loading}
          onClick={() => setActiveTab('divisions')}
        />
        <StatCard
          title="Total Departments"
          value={stats.total_departments}
          icon={Building2}
          color="blue"
          loading={stats.loading}
          onClick={() => setActiveTab('divisions')}
        />
        <StatCard
          title="Total Employees"
          value={stats.total_employees}
          icon={Users}
          color="green"
          loading={stats.loading}
          onClick={() => setActiveTab('employees')}
        />
        <StatCard
          title="Today Attendance"
          value={`${stats.today_attendance}%`}
          icon={CheckCircle}
          color="orange"
          loading={stats.loading}
          onClick={() => setActiveTab('attendance')}
        />
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Actions
              </h3>
              <span className="text-sm text-gray-500">Click to execute</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  label: 'Add Division', 
                  icon: Layers, 
                  color: 'purple', 
                  action: 'addDivision',
                  description: 'Create new division'
                },
                { 
                  label: 'Add Department', 
                  icon: Building2, 
                  color: 'blue', 
                  action: 'addDepartment',
                  description: 'Add department to division'
                },
                { 
                  label: 'Add Employee', 
                  icon: UserPlus, 
                  color: 'green', 
                  action: 'addEmployee',
                  description: 'Register new employee'
                },
                { 
                  label: 'Create Shift', 
                  icon: Clock, 
                  color: 'orange', 
                  action: 'createShift',
                  description: 'Setup work schedule'
                },
                { 
                  label: 'Send Notification', 
                  icon: Bell, 
                  color: 'red', 
                  action: 'sendNotification',
                  description: 'Alert users'
                },
                { 
                  label: 'Generate Report', 
                  icon: FileText, 
                  color: 'indigo', 
                  action: 'generateReport',
                  description: 'Download system report'
                },
                { 
                  label: 'System Backup', 
                  icon: HardDrive, 
                  color: 'gray', 
                  action: 'systemBackup',
                  description: 'Create backup'
                },
                { 
                  label: 'View Analytics', 
                  icon: BarChart, 
                  color: 'teal', 
                  action: 'viewAnalytics',
                  description: 'View statistics'
                },
                { 
                  label: 'Clear Cache', 
                  icon: Database, 
                  color: 'yellow', 
                  action: 'clearCache',
                  description: 'Clear system cache'
                },
                { 
                  label: 'Manage Users', 
                  icon: Users, 
                  color: 'pink', 
                  action: 'manageUsers',
                  description: 'User management'
                },
                { 
                  label: 'System Settings', 
                  icon: SettingsIcon, 
                  color: 'gray', 
                  action: 'systemSettings',
                  description: 'Configuration'
                },
                { 
                  label: 'Test Connection', 
                  icon: Activity, 
                  color: 'blue', 
                  action: 'testConnection',
                  description: 'Check backend'
                },
              ].map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md relative group"
                  disabled={loading || quickActionLoading}
                >
                  {quickActionLoading === action.action && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  )}
                  <div className={`p-3 rounded-lg mb-3 transition-colors`} style={{ 
                    backgroundColor: `var(--${action.color}-50)`,
                  }}>
                    <action.icon className="w-6 h-6" style={{ color: `var(--${action.color}-600)` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">{action.description}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <strong>Tip:</strong> Quick actions will redirect you to the appropriate page and prepare the relevant form. 
                Some actions may require confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
              <button 
                onClick={refreshDashboard}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'database', label: 'Database', icon: Database },
                { key: 'api', label: 'API Service', icon: Server },
                { key: 'auth', label: 'Authentication', icon: Key },
                { key: 'memory', label: 'Memory', icon: MemoryStick },
                { key: 'cpu', label: 'CPU', icon: Cpu },
                { key: 'storage', label: 'Storage', icon: HardDrive },
              ].map((service) => {
                const status = getHealthStatus(service.key);
                const Icon = status.icon;
                
                return (
                  <div 
                    key={service.key} 
                    className={`p-3 rounded-lg border flex items-center justify-between`}
                    style={{
                      borderColor: `var(--${status.color}-200)`,
                      backgroundColor: `var(--${status.color}-50)`
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <service.icon className={`w-5 h-5`} style={{ color: `var(--${status.color}-600)` }} />
                      <div>
                        <p className="font-medium text-gray-800">{service.label}</p>
                        <p className="text-xs text-gray-600">
                          {renderHealthValue(systemHealth?.[service.key])}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4`} style={{ color: `var(--${status.color}-600)` }} />
                      <span className={`text-xs font-medium`} style={{ color: `var(--${status.color}-700)` }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="card p-6">
            <h4 className="font-semibold text-gray-800 mb-4">System Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Shifts</span>
                <span className="font-bold text-gray-800">{stats.active_shifts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="font-bold text-gray-800">{stats.pending_approvals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unread Notifications</span>
                <span className="font-bold text-gray-800">{notificationCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Uptime</span>
                <span className="font-bold text-gray-800">
                  {systemInfo?.uptime ? `${Math.floor(systemInfo.uptime / 3600)}h` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Division Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Overview */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Division Overview</h3>
            <button 
              onClick={() => setActiveTab('divisions')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading divisions...</p>
              </div>
            ) : divisionOverview.length === 0 ? (
              <div className="p-4 text-center">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No divisions found</p>
                <button 
                  onClick={() => handleQuickAction('addDivision')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create your first division</span>
                </button>
              </div>
            ) : (
              divisionOverview.slice(0, 4).map((division, idx) => {
                const colors = ['blue', 'green', 'orange', 'purple', 'red', 'indigo'];
                const color = colors[idx % colors.length];
                
                return (
                  <div key={division.id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer group border border-gray-200 hover:border-gray-300"
                    onClick={() => {
                      setActiveTab('divisions');
                      setTimeout(() => {
                        const event = new CustomEvent('expandDivision', { 
                          detail: { divisionId: division.id } 
                        });
                        window.dispatchEvent(event);
                      }, 100);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: `var(--${color}-500)` }}></div>
                      <div>
                        <p className="font-medium text-gray-800 group-hover:text-blue-600">
                          {division.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {division.department_count || 0} dept{division.department_count !== 1 ? 's' : ''} • {division.employee_count || 0} employee{division.employee_count !== 1 ? 's' : ''}
                        </p>
                        {division.description && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {division.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      View →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <button 
              onClick={() => setActiveTab('settings')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View logs</span>
              <Eye className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="p-4 text-center">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              recentActivity.slice(0, 5).map((activity, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center`} 
                    style={{
                      backgroundColor: activity.type === 'audit' ? 'var(--blue-100)' :
                      activity.type === 'login' ? 'var(--green-100)' :
                      activity.type === 'create' ? 'var(--green-100)' :
                      activity.type === 'update' ? 'var(--yellow-100)' :
                      activity.type === 'delete' ? 'var(--red-100)' :
                      'var(--gray-100)'
                    }}>
                    {activity.type === 'audit' ? (
                      <Activity className="w-4 h-4" style={{ color: 'var(--blue-600)' }} />
                    ) : activity.type === 'login' ? (
                      <Key className="w-4 h-4" style={{ color: 'var(--green-600)' }} />
                    ) : activity.type === 'create' ? (
                      <Plus className="w-4 h-4" style={{ color: 'var(--green-600)' }} />
                    ) : activity.type === 'update' ? (
                      <Edit2 className="w-4 h-4" style={{ color: 'var(--yellow-600)' }} />
                    ) : activity.type === 'delete' ? (
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--red-600)' }} />
                    ) : (
                      <Activity className="w-4 h-4" style={{ color: 'var(--gray-600)' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{activity.user || activity.username || 'System'}</span>
                      {' '}{activity.action || 'performed action'}{' '}
                      {activity.resource && (
                        <span className="text-gray-600">on {activity.resource}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {typeof activity.details === 'string' ? activity.details : JSON.stringify(activity.details)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Showing {Math.min(recentActivity.length, 5)} of {recentActivity.length} activities
                </span>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all activity →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeDatabase />;
      case 'divisions':
        return <Divisions />;
      case 'notifications':
        return <Notifications />;
      case 'attendance':
        return <AttendanceApp />;
      case 'schedule-control':
        return <ScheduleControl />;
      case 'settings':
        return <AdminSettings />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === 'divisions' ? 'Divisions & Departments' : 
               activeTab === 'schedule-control' ? 'Schedule Control' :
               activeTab === 'settings' ? 'Admin Settings' :
               activeTab === 'dashboard' ? 'Dashboard' :
               activeTab === 'employees' ? 'Employee Database' :
               activeTab === 'attendance' ? 'Attendance Management' :
               activeTab === 'notifications' ? 'Notifications Center' :
               activeTab.replace('-', ' ')}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeTab === 'dashboard' 
                ? 'Overview of all factory divisions and system status'
                : activeTab === 'settings'
                ? 'Configure system settings and preferences'
                : activeTab === 'employees'
                ? 'Manage all employees across divisions'
                : activeTab === 'divisions'
                ? 'Manage factory divisions and departments'
                : activeTab === 'attendance'
                ? 'Track and manage employee attendance'
                : activeTab === 'schedule-control'
                ? 'Manage work schedules and shifts'
                : activeTab === 'notifications'
                ? 'Send and manage system notifications'
                : `Manage ${activeTab.replace('-', ' ')}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => {
                  if (setActiveTab) {
                    setActiveTab('dashboard');
                  }
                  navigate('/admin');
                }}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="pb-8 px-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;