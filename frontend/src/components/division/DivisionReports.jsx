import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, TrendingUp, TrendingDown, Calendar, Filter, BarChart3, Users, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionManagerService } from '../../services/divisionManagerService';

const DivisionReports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadDepartments();
    loadGeneratedReports();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await divisionManagerService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadGeneratedReports = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from API
      const mockReports = [
        { id: 1, name: 'Monthly Attendance Report', type: 'attendance', generated: new Date().toISOString().split('T')[0], size: '2.4 MB', status: 'ready', format: 'pdf' },
        { id: 2, name: 'Weekly Shift Coverage', type: 'schedule', generated: new Date(Date.now() - 86400000).toISOString().split('T')[0], size: '1.8 MB', status: 'ready', format: 'excel' },
        { id: 3, name: 'Overtime Analysis', type: 'overtime', generated: new Date(Date.now() - 172800000).toISOString().split('T')[0], size: '3.2 MB', status: 'ready', format: 'pdf' },
        { id: 4, name: 'Department Performance', type: 'performance', generated: new Date(Date.now() - 259200000).toISOString().split('T')[0], size: '4.1 MB', status: 'ready', format: 'pdf' },
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      
      // Get date range
      let startDate, endDate;
      const today = new Date();
      
      switch(dateRange) {
        case 'week':
          startDate = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'quarter':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
      }

      // Call API to generate report
      const reportData = await divisionManagerService.generateReport(reportType, startDate, endDate);
      
      // Add to reports list
      const newReport = {
        id: Date.now(),
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type: reportType,
        generated: new Date().toISOString().split('T')[0],
        size: '1.5 MB',
        status: 'ready',
        format: 'pdf',
        data: reportData
      };
      
      setReports([newReport, ...reports]);
      alert(`✅ ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = async (reportId, format = 'pdf') => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        alert('Report not found');
        return;
      }

      // Simulate download
      alert(`Downloading ${report.name} as ${format.toUpperCase()}...`);
      
      // In a real app, this would download the actual file
      console.log('Downloading report:', report);
      
      // Mock download delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('✅ Report downloaded successfully!');
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const printReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      alert('Report not found');
      return;
    }
    
    alert(`Printing ${report.name}...`);
    // In a real app, this would open print dialog
    window.print();
  };

  const getDepartmentStats = () => {
    // Mock department statistics
    return departments.map(dept => ({
      ...dept,
      attendance: 90 + Math.random() * 10,
      productivity: 85 + Math.random() * 15,
      overtime: Math.random() * 20,
      efficiency: 75 + Math.random() * 20,
    }));
  };

  const departmentStats = getDepartmentStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Division Reports</h3>
          <p className="text-gray-600">Generate and view reports for your division</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            className="btn-secondary flex items-center space-x-2"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            <span>Print All</span>
          </button>
          <button 
            className="btn-primary flex items-center space-x-2"
            onClick={generateReport}
            disabled={generatingReport}
          >
            {generatingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Type Filter */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="attendance">Attendance Reports</option>
              <option value="schedule">Schedule Reports</option>
              <option value="performance">Performance Reports</option>
              <option value="overtime">Overtime Reports</option>
              <option value="leave">Leave Reports</option>
              <option value="productivity">Productivity Reports</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Quick Report Buttons */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <button 
            onClick={() => setReportType('attendance')}
            className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
              reportType === 'attendance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-sm">Attendance</span>
          </button>
          <button 
            onClick={() => setReportType('schedule')}
            className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
              reportType === 'schedule' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Schedule</span>
          </button>
          <button 
            onClick={() => setReportType('performance')}
            className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
              reportType === 'performance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Performance</span>
          </button>
          <button 
            onClick={() => setReportType('overtime')}
            className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
              reportType === 'overtime' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">Overtime</span>
          </button>
          <button 
            onClick={() => setReportType('leave')}
            className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
              reportType === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Leave</span>
          </button>
          <button 
            onClick={() => setReportType('productivity')}
            className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
              reportType === 'productivity' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Productivity</span>
          </button>
        </div>
      </div>

      {/* Department Performance */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">Department Performance Summary</h4>
          <button 
            onClick={() => setReportType('performance')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View Detailed Report →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productivity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departmentStats.map((dept, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dept.manager?.name || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-green-500" 
                          style={{ width: `${dept.attendance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{dept.attendance.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500" 
                          style={{ width: `${dept.productivity}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{dept.productivity.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{dept.overtime.toFixed(1)}h</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-purple-500" 
                          style={{ width: `${dept.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{dept.efficiency.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {dept.trend >= 0 ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+{dept.trend?.toFixed(1) || '5.2'}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span>{dept.trend?.toFixed(1) || '-2.1'}%</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-800">Generated Reports</h4>
          <span className="text-sm text-gray-600">{reports.length} reports</span>
        </div>
        
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No reports generated yet</p>
              <button 
                onClick={generateReport}
                className="mt-3 btn-primary"
              >
                Generate Your First Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map(report => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-800">{report.name}</h5>
                      <p className="text-xs text-gray-500">Generated: {report.generated}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'ready' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{report.type}</span>
                    </div>
                    <span>{report.size}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadReport(report.id, report.format)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={() => printReport(report.id)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={async () => {
            setReportType('attendance');
            await generateReport();
          }}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <span className="font-medium text-gray-800">Quick Attendance Report</span>
          <span className="text-sm text-gray-600">Generate now</span>
        </button>
        
        <button 
          onClick={async () => {
            setReportType('schedule');
            await generateReport();
          }}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Calendar className="w-8 h-8 text-green-600 mb-2" />
          <span className="font-medium text-gray-800">Weekly Schedule Report</span>
          <span className="text-sm text-gray-600">Generate now</span>
        </button>
        
        <button 
          onClick={async () => {
            setReportType('overtime');
            await generateReport();
          }}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Clock className="w-8 h-8 text-orange-600 mb-2" />
          <span className="font-medium text-gray-800">Overtime Analysis</span>
          <span className="text-sm text-gray-600">Generate now</span>
        </button>
        
        <button 
          onClick={async () => {
            setReportType('performance');
            await generateReport();
          }}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
          <span className="font-medium text-gray-800">Performance Summary</span>
          <span className="text-sm text-gray-600">Generate now</span>
        </button>
      </div>
    </div>
  );
};

export default DivisionReports;