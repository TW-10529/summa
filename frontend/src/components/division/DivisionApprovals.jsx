import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Filter, AlertCircle, Download, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { divisionManagerService } from '../../services/divisionManagerService';

const DivisionApprovals = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await divisionManagerService.getPendingApprovals();
      
      // Add mock data for testing
      const mockApprovals = [
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
        },
        {
          id: 4,
          type: 'leave',
          employee_name: 'Maria Garcia',
          employee_id: 'EMP004',
          department_id: 2,
          department_name: 'Production Line B',
          request_date: new Date(Date.now() - 86400000).toISOString(),
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
          reason: 'Medical appointment',
          status: 'approved',
          employee_email: 'maria.garcia@factory.com',
          leave_type: 'medical',
          days: 5
        },
        {
          id: 5,
          type: 'overtime',
          employee_name: 'David Wilson',
          employee_id: 'EMP005',
          department_id: 1,
          department_name: 'Production Line A',
          request_date: new Date(Date.now() - 172800000).toISOString(),
          date: new Date(Date.now() - 86400000).toISOString(),
          hours: 4,
          reason: 'Machine breakdown repair',
          status: 'rejected',
          employee_email: 'david.wilson@factory.com',
          project_name: 'Maintenance',
          rejection_reason: 'Not approved by department head'
        }
      ];

      setApprovals(mockApprovals);
      
      // Calculate stats
      const pendingCount = mockApprovals.filter(a => a.status === 'pending').length;
      const approvedCount = mockApprovals.filter(a => a.status === 'approved').length;
      const rejectedCount = mockApprovals.filter(a => a.status === 'rejected').length;
      
      setStats({
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: mockApprovals.length
      });
      
    } catch (error) {
      console.error('Error loading approvals:', error);
      alert('Failed to load approvals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;

      // Update locally first
      const updatedApprovals = approvals.map(a => 
        a.id === approvalId ? { ...a, status: 'approved' } : a
      );
      setApprovals(updatedApprovals);

      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));

      // In a real app, you would call the API here
      // await divisionManagerService.approveRequest(approvalId);
      
      alert(`✅ ${approval.type.replace('_', ' ')} request approved!`);
      
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (approvalId, reason = '') => {
    try {
      const approval = approvals.find(a => a.id === approvalId);
      if (!approval) return;

      const rejectionReason = prompt('Please enter rejection reason:', '');
      if (rejectionReason === null) return;

      // Update locally first
      const updatedApprovals = approvals.map(a => 
        a.id === approvalId ? { ...a, status: 'rejected', rejection_reason: rejectionReason } : a
      );
      setApprovals(updatedApprovals);

      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));

      // In a real app, you would call the API here
      // await divisionManagerService.rejectRequest(approvalId, rejectionReason);
      
      alert(`❌ ${approval.type.replace('_', ' ')} request rejected.`);

    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowDetails(true);
  };

  const handleBulkApprove = () => {
    const pendingApprovals = approvals.filter(a => a.status === 'pending');
    if (pendingApprovals.length === 0) {
      alert('No pending approvals to approve.');
      return;
    }

    if (!confirm(`Approve all ${pendingApprovals.length} pending requests?`)) {
      return;
    }

    const updatedApprovals = approvals.map(a => 
      a.status === 'pending' ? { ...a, status: 'approved' } : a
    );
    
    setApprovals(updatedApprovals);
    setStats({
      pending: 0,
      approved: stats.approved + pendingApprovals.length,
      rejected: stats.rejected,
      total: stats.total
    });

    alert(`✅ ${pendingApprovals.length} requests approved successfully!`);
  };

  const handleExportApprovals = () => {
    const dataStr = JSON.stringify(approvals, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `approvals_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Approvals exported successfully!');
  };

  const filteredApprovals = filter === 'all' 
    ? approvals 
    : approvals.filter(a => a.status === filter || a.type === filter);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'leave': return '🏖️';
      case 'overtime': return '⏰';
      case 'shift_change': return '🔄';
      default: return '📄';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h3 className="text-lg font-semibold text-gray-800">Approvals Management</h3>
          <p className="text-gray-600">Review and manage approval requests from departments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportApprovals}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button 
            onClick={handleBulkApprove}
            className="btn-primary flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve All Pending</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.pending}</h3>
          <p className="text-sm text-gray-600">Awaiting approval</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-600">Approved</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.approved}</h3>
          <p className="text-sm text-gray-600">Requests approved</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">Rejected</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.rejected}</h3>
          <p className="text-sm text-gray-600">Requests rejected</p>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats.total}</h3>
          <p className="text-sm text-gray-600">All requests</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All Requests ({stats.total})
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pending ({stats.pending})
            </button>
            <button 
              onClick={() => setFilter('leave')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Leave Requests
            </button>
            <button 
              onClick={() => setFilter('overtime')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'overtime' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Overtime Requests
            </button>
            <button 
              onClick={() => setFilter('shift_change')}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'shift_change' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Shift Changes
            </button>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-800">Approval Requests</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApprovals.map((approval) => (
                <tr key={approval.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getTypeIcon(approval.type)}</span>
                      <span className="text-sm font-medium capitalize">{approval.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{approval.employee_name}</div>
                      <div className="text-xs text-gray-500">{approval.employee_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{approval.department_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {approval.type === 'leave' && (
                        <div>
                          {approval.days} days ({approval.leave_type})
                        </div>
                      )}
                      {approval.type === 'overtime' && (
                        <div>{approval.hours} hours</div>
                      )}
                      {approval.type === 'shift_change' && (
                        <div>{approval.current_shift} → {approval.requested_shift}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(approval.request_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(approval.status)}`}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(approval)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {approval.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(approval.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(approval.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Details Modal */}
      {showDetails && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 capitalize">
                  {selectedApproval.type.replace('_', ' ')} Request Details
                </h4>
                <p className="text-gray-600">Review request details before taking action</p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Employee Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">Employee Information</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Name</label>
                    <p className="font-medium">{selectedApproval.employee_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Employee ID</label>
                    <p className="font-medium">{selectedApproval.employee_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedApproval.employee_email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Department</label>
                    <p className="font-medium">{selectedApproval.department_name}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">Request Details</h5>
                <div className="space-y-3">
                  {selectedApproval.type === 'leave' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Leave Type:</span>
                        <span className="font-medium capitalize">{selectedApproval.leave_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{selectedApproval.days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">{new Date(selectedApproval.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">{new Date(selectedApproval.end_date).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}

                  {selectedApproval.type === 'overtime' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{new Date(selectedApproval.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-medium">{selectedApproval.hours} hours</span>
                      </div>
                      {selectedApproval.project_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Project:</span>
                          <span className="font-medium">{selectedApproval.project_name}</span>
                        </div>
                      )}
                    </>
                  )}

                  {selectedApproval.type === 'shift_change' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Shift:</span>
                        <span className="font-medium">{selectedApproval.current_shift}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requested Shift:</span>
                        <span className="font-medium">{selectedApproval.requested_shift}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effective Date:</span>
                        <span className="font-medium">{new Date(selectedApproval.effective_date).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason:</span>
                      <span className="font-medium text-right">{selectedApproval.reason}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Actions */}
              {selectedApproval.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      handleReject(selectedApproval.id);
                      setShowDetails(false);
                    }}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedApproval.id);
                      setShowDetails(false);
                    }}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DivisionApprovals;