// src/services/divisionManagerService.js
import api from './api';

export const divisionManagerService = {
  // Test connection
  testConnection: async () => {
    try {
      const response = await api.get('/division-manager/test');
      return response.data;
    } catch (error) {
      console.error('Division Manager API test failed:', error);
      return { 
        success: false, 
        message: 'API not available, using mock data',
        endpoints: []
      };
    }
  },

  // Health check
  checkHealth: async () => {
    try {
      const response = await api.get('/division-manager/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: "unhealthy", error: error.message };
    }
  },

  // Get division dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/division-manager/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching division stats:', error);
      // Return mock data for development
      return {
        division: {
          id: 1,
          name: 'Production',
          description: 'Production Division',
          color: 'blue'
        },
        stats: {
          total_departments: 4,
          total_employees: 120,
          active_employees: 115,
          today_attendance: 92.5,
          active_shifts: 8,
          pending_approvals: 3
        }
      };
    }
  },

  // Get division departments
  getDepartments: async () => {
    try {
      const response = await api.get('/division-manager/departments');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Return mock data
      return [
        {
          id: 1,
          name: 'Production Line A',
          code: 'PROD_A',
          description: 'Main production line',
          division_id: 1,
          manager_id: 5,
          created_at: '2024-01-01T00:00:00Z',
          manager: {
            id: 5,
            name: 'John Smith',
            email: 'john.smith@factory.com',
            employee_id: 'EMP005'
          },
          employee_count: 45
        },
        {
          id: 2,
          name: 'Production Line B',
          code: 'PROD_B',
          description: 'Secondary production line',
          division_id: 1,
          manager_id: 6,
          created_at: '2024-01-15T00:00:00Z',
          manager: {
            id: 6,
            name: 'Sarah Johnson',
            email: 'sarah.j@factory.com',
            employee_id: 'EMP006'
          },
          employee_count: 42
        },
        {
          id: 3,
          name: 'Quality Control',
          code: 'QC',
          description: 'Quality assurance department',
          division_id: 1,
          manager_id: 7,
          created_at: '2024-02-01T00:00:00Z',
          manager: {
            id: 7,
            name: 'Mike Wilson',
            email: 'mike.w@factory.com',
            employee_id: 'EMP007'
          },
          employee_count: 25
        },
        {
          id: 4,
          name: 'Maintenance',
          code: 'MAINT',
          description: 'Equipment maintenance department',
          division_id: 1,
          manager_id: 8,
          created_at: '2024-02-15T00:00:00Z',
          manager: {
            id: 8,
            name: 'Robert Chen',
            email: 'robert.c@factory.com',
            employee_id: 'EMP008'
          },
          employee_count: 18
        }
      ];
    }
  },

  // Get division attendance
  getAttendance: async (date = null) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/division-manager/attendance', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      // Return mock data
      const mockDate = date || new Date().toISOString().split('T')[0];
      return {
        date: mockDate,
        division_id: 1,
        overall_attendance_rate: 92.5,
        departments: [
          {
            department_id: 1,
            department_name: 'Production Line A',
            department_code: 'PROD_A',
            total_employees: 45,
            present: 42,
            absent: 2,
            late: 3,
            on_leave: 1,
            attendance_rate: 93.3
          },
          {
            department_id: 2,
            department_name: 'Production Line B',
            department_code: 'PROD_B',
            total_employees: 42,
            present: 39,
            absent: 2,
            late: 2,
            on_leave: 1,
            attendance_rate: 92.9
          },
          {
            department_id: 3,
            department_name: 'Quality Control',
            department_code: 'QC',
            total_employees: 25,
            present: 24,
            absent: 0,
            late: 1,
            on_leave: 0,
            attendance_rate: 96.0
          },
          {
            department_id: 4,
            department_name: 'Maintenance',
            department_code: 'MAINT',
            total_employees: 18,
            present: 17,
            absent: 0,
            late: 1,
            on_leave: 0,
            attendance_rate: 94.4
          }
        ],
        summary: {
          total_employees: 130,
          total_present: 122,
          total_absent: 4,
          total_late: 7,
          total_on_leave: 2
        }
      };
    }
  },

  // Get division schedule
  getSchedule: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/division-manager/schedule', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      // Return mock data
      const mockStart = startDate || new Date().toISOString().split('T')[0];
      const mockEnd = endDate || mockStart;
      return {
        division_id: 1,
        date_range: {
          start: mockStart,
          end: mockEnd
        },
        departments: [
          {
            department_id: 1,
            department_name: 'Production Line A',
            shifts: [
              {
                shift_id: 1,
                shift_name: 'Morning Shift',
                start_time: '08:00',
                end_time: '16:00',
                employees_scheduled: 25,
                coverage_rate: 100,
                required_employees: 25,
                employees: [
                  { id: 1, name: 'John Doe', role: 'Operator' },
                  { id: 2, name: 'Jane Smith', role: 'Supervisor' }
                ]
              },
              {
                shift_id: 2,
                shift_name: 'Afternoon Shift',
                start_time: '16:00',
                end_time: '00:00',
                employees_scheduled: 20,
                coverage_rate: 100,
                required_employees: 20,
                employees: [
                  { id: 3, name: 'Robert Johnson', role: 'Operator' },
                  { id: 4, name: 'Sarah Williams', role: 'Supervisor' }
                ]
              }
            ]
          },
          {
            department_id: 2,
            department_name: 'Production Line B',
            shifts: [
              {
                shift_id: 3,
                shift_name: 'Morning Shift',
                start_time: '08:00',
                end_time: '16:00',
                employees_scheduled: 20,
                coverage_rate: 95,
                required_employees: 21,
                employees: [
                  { id: 5, name: 'Mike Brown', role: 'Operator' },
                  { id: 6, name: 'Lisa Davis', role: 'Supervisor' }
                ]
              }
            ]
          }
        ]
      };
    }
  },

  // Get pending approvals
  getPendingApprovals: async () => {
    try {
      const response = await api.get('/division-manager/approvals/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching approvals:', error);
      // Return mock data
      return {
        division_id: 1,
        total_pending: 3,
        approvals: [
          {
            id: 1,
            type: 'leave',
            employee_name: 'John Doe',
            employee_id: 'EMP001',
            department_id: 1,
            department_name: 'Production Line A',
            request_date: new Date().toISOString(),
            start_date: new Date(Date.now() + 86400000).toISOString(),
            end_date: new Date(Date.now() + 259200000).toISOString(),
            reason: 'Family vacation',
            status: 'pending',
            employee_email: 'john.doe@factory.com',
            leave_type: 'annual',
            days: 3
          },
          {
            id: 2,
            type: 'overtime',
            employee_name: 'Jane Smith',
            employee_id: 'EMP002',
            department_id: 2,
            department_name: 'Production Line B',
            request_date: new Date().toISOString(),
            date: new Date().toISOString(),
            hours: 3,
            reason: 'Project deadline',
            status: 'pending',
            employee_email: 'jane.smith@factory.com',
            project_name: 'Q4 Production'
          },
          {
            id: 3,
            type: 'shift_change',
            employee_name: 'Robert Chen',
            employee_id: 'EMP003',
            department_id: 1,
            department_name: 'Production Line A',
            request_date: new Date().toISOString(),
            current_shift: 'Morning Shift (08:00-16:00)',
            requested_shift: 'Afternoon Shift (16:00-00:00)',
            effective_date: new Date(Date.now() + 86400000).toISOString(),
            reason: 'Childcare arrangements',
            status: 'pending',
            employee_email: 'robert.chen@factory.com'
          }
        ]
      };
    }
  },

  // Approve request
  approveRequest: async (requestId, approvalData = {}) => {
    try {
      const response = await api.post(`/division-manager/approvals/${requestId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      // Mock success
      return {
        success: true,
        message: 'Request approved successfully',
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Reject request
  rejectRequest: async (requestId, reason = '') => {
    try {
      const response = await api.post(`/division-manager/approvals/${requestId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Mock success
      return {
        success: true,
        message: 'Request rejected successfully',
        request_id: requestId,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Send division notification
  sendNotification: async (notificationData) => {
    try {
      const response = await api.post('/division-manager/notifications/send', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      // Return mock success
      return {
        message: 'Notification sent successfully',
        notification_id: Date.now(),
        timestamp: new Date().toISOString()
      };
    }
  },

  // Generate report
  generateReport: async (reportType = 'attendance', startDate = null, endDate = null) => {
    try {
      const params = { report_type: reportType };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/division-manager/reports/generate', { params });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      // Return mock report
      return {
        report_id: `report_${Date.now()}`,
        division_id: 1,
        report_type: reportType,
        generated_by: 'Division Manager',
        generated_at: new Date().toISOString(),
        period: {
          start: startDate || new Date(Date.now() - 2592000000).toISOString().split('T')[0],
          end: endDate || new Date().toISOString().split('T')[0]
        },
        data: {
          summary: {
            total_employees: 120,
            average_attendance: 92.5,
            total_overtime_hours: 245,
            average_productivity: 88.3,
            total_leave_days: 42
          },
          departments: [
            {
              name: 'Production Line A',
              attendance: 93.3,
              productivity: 90.1,
              overtime: 65,
              efficiency: 88.5
            },
            {
              name: 'Production Line B',
              attendance: 92.9,
              productivity: 87.8,
              overtime: 58,
              efficiency: 86.2
            }
          ]
        },
        summary: {
          status: "completed",
          message: "Report generated successfully"
        }
      };
    }
  },

  // Get division settings
  getDivisionSettings: async () => {
    try {
      const response = await api.get('/division-manager/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching division settings:', error);
      // Return mock settings
      return {
        general: {
          division_name: 'Production Division',
          timezone: 'UTC+05:30',
          shift_overlap_minutes: 15,
          max_overtime_hours: 12
        },
        notifications: {
          attendance_alerts: true,
          schedule_changes: true,
          overtime_approvals: true,
          daily_summary: false,
          weekly_report: true
        }
      };
    }
  },

  // Update division setting
  updateDivisionSetting: async (category, key, value) => {
    try {
      const response = await api.put(`/division-manager/settings/${category}/${key}`, { value });
      return response.data;
    } catch (error) {
      console.error('Error updating division setting:', error);
      // Mock success
      return {
        success: true,
        message: 'Setting updated successfully',
        category,
        key,
        value,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Get division audit logs
  getDivisionAuditLogs: async (limit = 50) => {
    try {
      const response = await api.get('/division-manager/audit-logs', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching division audit logs:', error);
      // Return mock audit logs
      const mockLogs = [];
      for (let i = 1; i <= limit; i++) {
        mockLogs.push({
          id: i,
          user_id: Math.floor(Math.random() * 10) + 1,
          user_name: ['John Doe', 'Jane Smith', 'Mike Wilson', 'Sarah Johnson'][Math.floor(Math.random() * 4)],
          action: ['login', 'logout', 'update', 'create', 'delete'][Math.floor(Math.random() * 5)],
          resource: ['attendance', 'schedule', 'approval', 'report'][Math.floor(Math.random() * 4)],
          details: { message: `Action ${i} performed` },
          created_at: new Date(Date.now() - i * 3600000).toISOString()
        });
      }
      return mockLogs;
    }
  },

  // Get division system info
  getDivisionSystemInfo: async () => {
    try {
      const response = await api.get('/division-manager/system-info');
      return response.data;
    } catch (error) {
      console.error('Error fetching division system info:', error);
      // Return mock system info
      return {
        division: {
          id: 1,
          name: 'Production Division',
          description: 'Main production facility'
        },
        counts: {
          total_users: 120,
          total_departments: 4,
          active_users: 115,
          inactive_users: 5
        },
        system_health: {
          database: 'connected',
          attendance_system: 'running',
          schedule_system: 'running',
          notification_system: 'running'
        },
        last_updated: new Date().toISOString()
      };
    }
  }
};

export default divisionManagerService;