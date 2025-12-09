import React, { useState } from 'react';
import { Calendar, Clock, FileText, Plus, CheckCircle, XCircle, Clock as ClockIcon, AlertCircle } from 'lucide-react';

const Requests = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [showNewRequest, setShowNewRequest] = useState(false);
  
  const [newRequest, setNewRequest] = useState({
    type: 'leave',
    date: '', // Used for leave requests
    startTime: '', // Used for overtime requests
    endTime: '', // Used for overtime requests
    reason: '',
  });

  // Initial requests data
  const initialRequests = {
    pending: [
      { id: 1, type: 'leave', title: 'Annual Leave', period: 'Jan 20-22, 2024', submitted: 'Jan 10, 2024', status: 'pending' },
      { id: 2, type: 'shift-swap', title: 'Shift Swap Request', period: 'Jan 18, 2024', submitted: 'Jan 12, 2024', status: 'pending' },
    ],
    approved: [
      { id: 3, type: 'overtime', title: 'Overtime Request', period: 'Jan 15, 2024 (18:00-21:00)', submitted: 'Jan 8, 2024', status: 'approved' },
      { id: 4, type: 'leave', title: 'Sick Leave', period: 'Jan 5, 2024', submitted: 'Jan 4, 2024', status: 'approved' },
    ],
    rejected: [
      { id: 5, type: 'shift-change', title: 'Shift Change Request', period: 'Jan 25, 2024', submitted: 'Jan 15, 2024', status: 'rejected', reason: 'No available coverage' },
    ],
  };

  // Use state for requests
  const [requests, setRequests] = useState(initialRequests);

  const getRequestIcon = (type) => {
    switch (type) {
      case 'leave': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'shift-swap': return <Clock className="w-5 h-5 text-purple-500" />;
      case 'overtime': return <ClockIcon className="w-5 h-5 text-orange-500" />;
      case 'shift-change': return <Clock className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRequestTitle = (type) => {
    switch (type) {
      case 'leave': return 'Leave Request';
      case 'overtime': return 'Overtime Request';
      default: return 'Request';
    }
  };

  // Date formatting
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Convert HH:MM to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get period based on request type
  const getPeriod = (type, date, startTime, endTime) => {
    const formattedDate = formatDate(date);
    
    if (type === 'overtime' && startTime && endTime) {
      const formattedStart = formatTime(startTime);
      const formattedEnd = formatTime(endTime);
      return `${formattedDate} (${formattedStart}-${formattedEnd})`;
    }
    
    return formattedDate;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Enhanced submit handler
  const handleSubmitRequest = () => {
    // Validation based on request type
    if (newRequest.type === 'leave') {
      if (!newRequest.date || !newRequest.reason) {
        alert('Please fill in date and reason for leave request!');
        return;
      }
    } else if (newRequest.type === 'overtime') {
      if (!newRequest.date || !newRequest.startTime || !newRequest.endTime || !newRequest.reason) {
        alert('Please fill in date, start time, end time, and reason for overtime request!');
        return;
      }
      // Validate time order
      if (newRequest.startTime >= newRequest.endTime) {
        alert('End time must be after start time!');
        return;
      }
    }
    
    // Create new request object
    const newRequestId = Date.now();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const requestToAdd = {
      id: newRequestId,
      type: newRequest.type,
      title: getRequestTitle(newRequest.type),
      period: getPeriod(newRequest.type, newRequest.date, newRequest.startTime, newRequest.endTime),
      submitted: today,
      status: 'pending',
      reason: newRequest.reason
    };
    
    // Add the new request to pending list
    setRequests(prev => ({
      ...prev,
      pending: [...prev.pending, requestToAdd]
    }));
    
    console.log('Submitting request:', requestToAdd);
    
    // Reset form and close modal
    setShowNewRequest(false);
    setNewRequest({
      type: 'leave',
      date: '',
      startTime: '',
      endTime: '',
      reason: '',
    });
    
    // Switch to pending tab to show the new request
    setActiveTab('pending');
  };

  // Cancel request handler
  const handleCancelRequest = (requestId) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      setRequests(prev => ({
        ...prev,
        pending: prev.pending.filter(request => request.id !== requestId)
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">My Requests</h3>
          <p className="text-gray-600">Manage your leave and shift requests</p>
        </div>
        <button
          onClick={() => setShowNewRequest(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
            <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
              {requests[tab].length}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests[activeTab].length === 0 ? (
          <div className="card p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No {activeTab} requests</h4>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'You have no pending requests.'
                : `You have no ${activeTab} requests.`}
            </p>
          </div>
        ) : (
          requests[activeTab].map((request) => (
            <div key={request.id} className="card p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  {getRequestIcon(request.type)}
                  <div>
                    <h4 className="font-semibold text-gray-800">{request.title}</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        {request.type === 'overtime' ? (
                          <ClockIcon className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Calendar className="w-4 h-4 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-700">{request.period}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Submitted: {request.submitted}</span>
                      </div>
                      {request.reason && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 text-sm rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  {request.status === 'pending' && (
                    <button 
                      onClick={() => handleCancelRequest(request.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">New Request</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                <select
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({
                    ...newRequest, 
                    type: e.target.value,
                    startTime: '', // Reset times when switching from overtime
                    endTime: ''
                  })}
                  className="input-field"
                >
                  <option value="leave">Leave Request</option>
                  <option value="overtime">Overtime Request</option>
                </select>
              </div>
              
              {/* Date Field (common for both types) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={newRequest.date}
                  onChange={(e) => setNewRequest({...newRequest, date: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              
              {/* Time Fields (only for overtime) */}
              {newRequest.type === 'overtime' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <input
                      type="time"
                      value={newRequest.startTime}
                      onChange={(e) => setNewRequest({...newRequest, startTime: e.target.value})}
                      className="input-field"
                      required={newRequest.type === 'overtime'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                    <input
                      type="time"
                      value={newRequest.endTime}
                      onChange={(e) => setNewRequest({...newRequest, endTime: e.target.value})}
                      className="input-field"
                      required={newRequest.type === 'overtime'}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  placeholder="Please provide details for your request..."
                  rows="3"
                  className="input-field"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowNewRequest(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="flex-1 btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;