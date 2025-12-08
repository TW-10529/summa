import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Calendar, Filter, BarChart3, Users, Clock, Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

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
      const mockReports = [
        { id: 1, name: 'Monthly Attendance Report', type: 'attendance', generated: '2024-01-20', size: '2.4 MB', status: 'ready', format: 'pdf' },
        { id: 2, name: 'Weekly Shift Coverage', type: 'schedule', generated: '2024-01-19', size: '1.8 MB', status: 'ready', format: 'excel' },
        { id: 3, name: 'Overtime Analysis', type: 'overtime', generated: '2024-01-18', size: '3.2 MB', status: 'ready', format: 'pdf' },
        { id: 4, name: 'Department Performance', type: 'performance', generated: '2024-01-17', size: '4.1 MB', status: 'ready', format: 'pdf' },
        { id: 5, name: 'Leave Report Q4', type: 'leave', generated: '2024-01-16', size: '1.5 MB', status: 'ready', format: 'pdf' },
        { id: 6, name: 'Productivity Report', type: 'productivity', generated: '2024-01-15', size: '2.8 MB', status: 'ready', format: 'excel' },
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

  const downloadReport = async (reportId) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        alert('Report not found');
        return;
      }

      alert(`Downloading ${report.name}...`);
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
    window.print();
  };

  const filteredReports = reports.filter(report => {
    if (searchTerm && !report.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (reportType !== 'all' && report.type !== reportType) {
      return false;
    }
    return true;
  });

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
            onClick={() => window.print()}
            className="btn-secondary flex items-center space-x-2"
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

      {/* Report Configuration */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Reports</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Reports</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Report Buttons */}
        <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
          <button 
            onClick={() => setReportType('attendance')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              reportType === 'attendance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 mb-1" />
            <span className="text-xs">Attendance</span>
          </button>
          <button 
            onClick={() => setReportType('schedule')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              reportType === 'schedule' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 mb-1" />
            <span className="text-xs">Schedule</span>
          </button>
          <button 
            onClick={() => setReportType('performance')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              reportType === 'performance' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-1" />
            <span className="text-xs">Performance</span>
          </button>
          <button 
            onClick={() => setReportType('overtime')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              reportType === 'overtime' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4 mb-1" />
            <span className="text-xs">Overtime</span>
          </button>
          <button 
            onClick={() => setReportType('leave')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              reportType === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 mb-1" />
            <span className="text-xs">Leave</span>
          </button>
          <button 
            onClick={() => setReportType('productivity')}
            className={`flex flex-col items-center p-2 rounded-lg ${
              reportType === 'productivity' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-1" />
            <span className="text-xs">Productivity</span>
          </button>
        </div>
      </div>

      {/* Generated Reports */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold text-gray-800">Generated Reports</h4>
          <span className="text-sm text-gray-600">{filteredReports.length} reports</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map(report => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 capitalize">
                      {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.generated}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{report.size}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'ready' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 uppercase">{report.format}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadReport(report.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => printReport(report.id)}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Generation */}
      <div className="card p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Quick Report Generation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={async () => {
              setReportType('attendance');
              await generateReport();
            }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <span className="font-medium text-gray-800">Attendance Report</span>
              <p className="text-sm text-gray-600">Generate now</p>
            </div>
          </button>
          
          <button 
            onClick={async () => {
              setReportType('schedule');
              await generateReport();
            }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <span className="font-medium text-gray-800">Weekly Schedule</span>
              <p className="text-sm text-gray-600">Generate now</p>
            </div>
          </button>
          
          <button 
            onClick={async () => {
              setReportType('overtime');
              await generateReport();
            }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <span className="font-medium text-gray-800">Overtime Report</span>
              <p className="text-sm text-gray-600">Generate now</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DivisionReports;