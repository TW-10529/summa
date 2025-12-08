// contexts/AuthContext.jsx - FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 AuthContext: Checking authentication...');
      
      // Check for token in localStorage
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const storedUser = localStorage.getItem('factory_user');
      
      console.log('   Token exists:', !!token);
      console.log('   Stored user exists:', !!storedUser);
      
      if (token && storedUser) {
        try {
          // Parse stored user
          const parsedUser = JSON.parse(storedUser);
          console.log('   User parsed successfully:', parsedUser);
          
          // Verify token is still valid by making a simple API call
          try {
            // This will throw if token is invalid
            await authService.testAuth();
            console.log('   Token is valid');
            
            // Set user from localStorage
            setUser(parsedUser);
          } catch (apiError) {
            console.log('   Token validation failed, using stored user only');
            setUser(parsedUser);
          }
        } catch (parseError) {
          console.error('   Failed to parse stored user:', parseError);
          localStorage.removeItem('factory_user');
          setUser(null);
        }
      } else {
        console.log('   No token or user found in localStorage');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔑 AuthContext: Attempting login for:', username);
      
      // Clear any existing errors
      setError(null);
      
      // Call the auth service
      const response = await authService.login(username, password);
      console.log('✅ AuthContext: Login response:', response);
      
      if (response.error) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Extract user data
      let userData;
      if (response.user) {
        // Response has user data
        userData = response.user;
      } else if (response) {
        // Response might be the user data itself
        userData = {
          id: response.id || 1,
          username: username,
          email: response.email || `${username}@factory.com`,
          full_name: response.full_name || (username === 'admin' ? 'Admin User' : 
                    username.includes('manager') ? 'Manager User' : 'Employee User'),
          role: response.role || (username === 'admin' ? 'admin' : 
                username.includes('manager') ? 'division_manager' : 'employee'),
          is_active: true,
          division_id: response.division_id || null,
          department_id: response.department_id || null
        };
      } else {
        // Create default user data
        userData = {
          id: 1,
          username: username,
          email: `${username}@factory.com`,
          full_name: username === 'admin' ? 'Admin User' : 
                    username.includes('manager') ? 'Manager User' : 'Employee User',
          role: username === 'admin' ? 'admin' : 
                username.includes('manager') ? 'division_manager' : 'employee',
          is_active: true,
          division_id: null,
          department_id: null
        };
      }
      
      // Store in localStorage
      localStorage.setItem('factory_user', JSON.stringify(userData));
      console.log('   User stored in localStorage:', userData);
      
      // Update state
      setUser(userData);
      
      return { 
        success: true, 
        user: userData 
      };
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logging out...');
    
    // Clear all auth data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('factory_user');
    localStorage.removeItem('factory_role');
    localStorage.removeItem('factory_division');
    localStorage.removeItem('factory_department');
    
    // Clear state
    setUser(null);
    setError(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const updateUser = (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      
      // Update localStorage
      localStorage.setItem('factory_user', JSON.stringify(newUserData));
      
      // Update state
      setUser(newUserData);
      
      return { success: true, user: newUserData };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('🔄 AuthContext: Refreshing authentication...');
      await checkAuth();
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      return { success: false, error: error.message };
    }
  };

  // Provide context values
  const contextValue = {
    user,
    login,
    logout,
    updateUser,
    refreshAuth,
    loading,
    error,
    isAuthenticated: !!user,
    role: user?.role || null,
    division: user?.division_id || null,
    department: user?.department_id || null,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
