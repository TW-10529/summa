// App.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminDashboard from './components/admin/AdminDashboard';
import DivisionDashboard from './components/division/DivisionDashboard';
import ManagerDashboard from './components/manager/ManagerDashboard';
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import Login from './components/auth/Login';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import your constants
import { ROLES } from './utils/constants';

// Loading screen component
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading application...</p>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    switch(user.role) {
      case ROLES.ADMIN:
        return <Navigate to="/admin" replace />;
      case ROLES.DIVISION_MANAGER:
        return <Navigate to="/division" replace />;
      case ROLES.DEPARTMENT_MANAGER:
        return <Navigate to="/manager" replace />;
      case ROLES.EMPLOYEE:
        return <Navigate to="/employee" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

// Main App component
function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Update activeTab when URL changes
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    
    // Admin tabs
    if (path.includes('/admin')) {
      if (path.includes('/employees') || path.endsWith('/admin/employees')) setActiveTab('employees');
      else if (path.includes('/divisions') || path.endsWith('/admin/divisions')) setActiveTab('divisions');
      else if (path.includes('/notifications') || path.endsWith('/admin/notifications')) setActiveTab('notifications');
      else if (path.includes('/attendance') || path.endsWith('/admin/attendance')) setActiveTab('attendance');
      else if (path.includes('/schedule') || path.endsWith('/admin/schedule') || path.includes('/schedule-control') || path.endsWith('/admin/schedule-control')) setActiveTab('schedule-control');
      else if (path.includes('/settings') || path.endsWith('/admin/settings')) setActiveTab('settings');
      else setActiveTab('dashboard');
    }
    
    // Division Manager tabs
    else if (path.includes('/division')) {
      if (path.includes('/attendance') || path.endsWith('/division/attendance')) setActiveTab('attendance');
      else if (path.includes('/schedule') || path.endsWith('/division/schedule')) setActiveTab('schedule');
      else if (path.includes('/departments') || path.endsWith('/division/departments')) setActiveTab('departments');
      else if (path.includes('/approvals') || path.endsWith('/division/approvals')) setActiveTab('approvals');
      else if (path.includes('/reports') || path.endsWith('/division/reports')) setActiveTab('reports');
      else if (path.includes('/notifications') || path.endsWith('/division/notifications')) setActiveTab('notifications');
      else setActiveTab('dashboard');
    }
    
    // Department Manager tabs
    else if (path.includes('/manager')) {
      if (path.includes('/attendance') || path.endsWith('/manager/attendance')) setActiveTab('attendance');
      else if (path.includes('/schedule') || path.endsWith('/manager/schedule')) setActiveTab('schedule');
      else if (path.includes('/employees') || path.endsWith('/manager/employees')) setActiveTab('employees');
      else if (path.includes('/notifications') || path.endsWith('/manager/notifications')) setActiveTab('notifications');
      else setActiveTab('dashboard');
    }
    
    // Employee tabs
    else if (path.includes('/employee')) {
      if (path.includes('/schedule') || path.endsWith('/employee/schedule')) setActiveTab('shifts');
      else if (path.includes('/attendance') || path.endsWith('/employee/attendance')) setActiveTab('attendance');
      else if (path.includes('/requests') || path.endsWith('/employee/requests')) setActiveTab('requests');
      else if (path.includes('/profile') || path.endsWith('/employee/profile')) setActiveTab('profile');
      else if (path.includes('/notifications') || path.endsWith('/employee/notifications')) setActiveTab('notifications');
      else setActiveTab('dashboard');
    }
  }, [location]);

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // If no user, show login page
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar role={user.role} />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Routes>
            {/* Admin Routes */}
            {user.role === ROLES.ADMIN && (
              <>
                <Route path="/" element={<Navigate to="/admin" />} />
                <Route 
                  path="/admin" 
                  element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/dashboard" 
                  element={<AdminDashboard activeTab="dashboard" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/employees" 
                  element={<AdminDashboard activeTab="employees" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/divisions" 
                  element={<AdminDashboard activeTab="divisions" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/notifications" 
                  element={<AdminDashboard activeTab="notifications" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/attendance" 
                  element={<AdminDashboard activeTab="attendance" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/schedule" 
                  element={<AdminDashboard activeTab="schedule-control" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/schedule-control" 
                  element={<AdminDashboard activeTab="schedule-control" setActiveTab={setActiveTab} />}
                />
                <Route 
                  path="/admin/settings" 
                  element={<AdminDashboard activeTab="settings" setActiveTab={setActiveTab} />}
                />
              </>
            )}

            {/* Division Manager Routes */}
            {user.role === ROLES.DIVISION_MANAGER && (
              <>
                <Route path="/" element={<Navigate to="/division" />} />
                <Route 
                  path="/division" 
                  element={<DivisionDashboard activeTab={activeTab} />}
                />
                <Route 
                  path="/division/attendance" 
                  element={<DivisionDashboard activeTab="attendance" />}
                />
                <Route 
                  path="/division/schedule" 
                  element={<DivisionDashboard activeTab="schedule" />}
                />
                <Route 
                  path="/division/departments" 
                  element={<DivisionDashboard activeTab="departments" />}
                />
                <Route 
                  path="/division/approvals" 
                  element={<DivisionDashboard activeTab="approvals" />}
                />
                <Route 
                  path="/division/reports" 
                  element={<DivisionDashboard activeTab="reports" />}
                />
                <Route 
                  path="/division/notifications" 
                  element={<DivisionDashboard activeTab="notifications" />}
                />
              </>
            )}

            {/* Department Manager Routes */}
            {user.role === ROLES.DEPARTMENT_MANAGER && (
              <>
                <Route path="/" element={<Navigate to="/manager" />} />
                <Route 
                  path="/manager" 
                  element={<ManagerDashboard activeTab={activeTab} />}
                />
                <Route 
                  path="/manager/dashboard" 
                  element={<ManagerDashboard activeTab="dashboard" />}
                />
                <Route 
                  path="/manager/attendance" 
                  element={<ManagerDashboard activeTab="attendance" />}
                />
                <Route 
                  path="/manager/schedule" 
                  element={<ManagerDashboard activeTab="schedule" />}
                />
                <Route 
                  path="/manager/employees" 
                  element={<ManagerDashboard activeTab="employees" />}
                />
                <Route 
                  path="/manager/notifications" 
                  element={<ManagerDashboard activeTab="notifications" />}
                />
              </>
            )}

            {/* Employee Routes */}
            {user.role === ROLES.EMPLOYEE && (
              <>
                <Route path="/" element={<Navigate to="/employee" />} />
                <Route 
                  path="/employee" 
                  element={<EmployeeDashboard activeTab={activeTab} />}
                />
                <Route 
                  path="/employee/dashboard" 
                  element={<EmployeeDashboard activeTab="dashboard" />}
                />
                <Route 
                  path="/employee/schedule" 
                  element={<EmployeeDashboard activeTab="shifts" />}
                />
                <Route 
                  path="/employee/attendance" 
                  element={<EmployeeDashboard activeTab="attendance" />}
                />
                <Route 
                  path="/employee/requests" 
                  element={<EmployeeDashboard activeTab="requests" />}
                />
                <Route 
                  path="/employee/notifications" 
                  element={<EmployeeDashboard activeTab="notifications" />}
                />
                <Route 
                  path="/employee/profile" 
                  element={<EmployeeDashboard activeTab="profile" />}
                />
              </>
            )}

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
}

// App wrapper with providers
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={<ProtectedRoute><AppContent /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;