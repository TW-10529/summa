// src/services/dashboardService.js
import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await api.get('/dashboard/stats');
      console.log('✅ Dashboard stats fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    try {
      console.log('📈 Fetching recent activity...');
      const response = await api.get('/dashboard/recent-activity', { params: { limit } });
      console.log(`✅ Found ${response.data?.activities?.length || 0} activities`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      throw error;
    }
  },

  // Get division overview
  getDivisionOverview: async () => {
    try {
      console.log('🏢 Fetching division overview...');
      const response = await api.get('/dashboard/division-overview');
      console.log(`✅ Found ${response.data?.divisions?.length || 0} divisions`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching division overview:', error);
      throw error;
    }
  },

  // Generate report
  generateReport: async (reportType = 'summary', startDate = null, endDate = null) => {
    try {
      console.log(`📄 Generating ${reportType} report...`);
      const params = { report_type: reportType };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.post('/dashboard/generate-report', null, { params });
      console.log('✅ Report generated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    }
  },

  // Quick actions
  quickAction: async (action, data = {}) => {
    try {
      console.log(`⚡ Quick action: ${action}`, data);
      
      // Map frontend actions to backend endpoints
      const actionMap = {
        'addDivision': { method: 'POST', endpoint: '/divisions' },
        'addDepartment': { method: 'POST', endpoint: '/departments' },
        'addEmployee': { method: 'POST', endpoint: '/users' },
        'createShift': { method: 'POST', endpoint: '/shifts' },
        'sendNotification': { method: 'POST', endpoint: '/notifications' },
        'generateReport': { method: 'POST', endpoint: '/dashboard/generate-report' },
        'systemBackup': { method: 'POST', endpoint: '/settings/backup' },
      };
      
      const config = actionMap[action];
      if (!config) {
        throw new Error(`Unknown action: ${action}`);
      }
      
      const response = await api({
        method: config.method,
        url: config.endpoint,
        data: data
      });
      
      console.log(`✅ Quick action ${action} completed:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error in quick action ${action}:`, error);
      throw error;
    }
  }
};

export default dashboardService;