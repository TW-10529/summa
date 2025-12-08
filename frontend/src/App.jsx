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
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';

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

// Component to extract tab from URL
const TabWrapper = ({ children }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get active tab from URL query parameter or pathname
  const getActiveTab = () => {
    // Check for tab query parameter
    const tabFromQuery = searchParams.get('tab');
    if (tabFromQuery) return tabFromQuery;
    
    // Extract from pathname
    const path = location.pathname;
    if (path.includes('/attendance')) return 'attendance';
    if (path.includes('/schedule')) return 'schedule';
    if (path.includes('/departments')) return 'departments';
    if (path.includes('/approvals')) return 'approvals';
    if (path.includes('/reports')) return 'reports';
    if (path.includes('/notifications')) return 'notifications';
    
    return 'dashboard';
  };

  const activeTab = getActiveTab();
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Update tab when URL changes
  useEffect(() => {
    setCurrentTab(getActiveTab());
  }, [location, searchParams]);

  // Clone children and pass activeTab prop
  return React.cloneElement(children, {
    activeTab: currentTab,
    setActiveTab: setCurrentTab
  });
};

// Main App component
function AppContent() {
  const { user, loading } = useAuth();

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
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/employees" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/divisions" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/notifications" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/attendance" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/schedule" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <TabWrapper>
                      <AdminDashboard />
                    </TabWrapper>
                  }
                />
              </>
            )}

            {/* Division Manager Routes */}
            {user.role === ROLES.DIVISION_MANAGER && (
              <>
                <Route path="/" element={<Navigate to="/division" />} />
                <Route 
                  path="/division" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/division/attendance" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/division/schedule" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/division/departments" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/division/approvals" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/division/reports" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/division/notifications" 
                  element={
                    <TabWrapper>
                      <DivisionDashboard />
                    </TabWrapper>
                  }
                />
              </>
            )}

            {/* Department Manager Routes */}
            {user.role === ROLES.DEPARTMENT_MANAGER && (
              <>
                <Route path="/" element={<Navigate to="/manager" />} />
                <Route 
                  path="/manager" 
                  element={
                    <TabWrapper>
                      <ManagerDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/manager/dashboard" 
                  element={
                    <TabWrapper>
                      <ManagerDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/manager/attendance" 
                  element={
                    <TabWrapper>
                      <ManagerDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/manager/schedule" 
                  element={
                    <TabWrapper>
                      <ManagerDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/manager/employees" 
                  element={
                    <TabWrapper>
                      <ManagerDashboard />
                    </TabWrapper>
                  }
                />
              </>
            )}

            {/* Employee Routes */}
            {user.role === ROLES.EMPLOYEE && (
              <>
                <Route path="/" element={<Navigate to="/employee" />} />
                <Route 
                  path="/employee" 
                  element={
                    <TabWrapper>
                      <EmployeeDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/employee/dashboard" 
                  element={
                    <TabWrapper>
                      <EmployeeDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/employee/schedule" 
                  element={
                    <TabWrapper>
                      <EmployeeDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/employee/attendance" 
                  element={
                    <TabWrapper>
                      <EmployeeDashboard />
                    </TabWrapper>
                  }
                />
                <Route 
                  path="/employee/requests" 
                  element={
                    <TabWrapper>
                      <EmployeeDashboard />
                    </TabWrapper>
                  }
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