import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    role: null,
    division: null,
    department: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  // In your checkAuth function
const checkAuth = async () => {
  const user = authService.getCurrentUser();
  
  if (user && authService.isAuthenticated()) {
    try {
      // Verify token is still valid by fetching profile
      const profile = await userService.getProfile();
      setAuthState({
        user: profile,  // Make sure this is set
        role: profile.role,
        division: profile.division_id,
        department: profile.department_id,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      // Token is invalid, logout
      logout();
    }
  } else {
    setAuthState(prev => ({ ...prev, loading: false }));
  }
};

  const login = async (username, password) => {
    try {
      const user = await authService.login(username, password);
      
      setAuthState({
        user,
        role: user.role,
        division: user.division_id,
        department: user.department_id,
        isAuthenticated: true,
        loading: false,
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      role: null,
      division: null,
      department: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const updateUser = (userData) => {
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData },
    }));
  };

  // Helper functions
  const getUserScope = () => {
    if (!authState.user) return null;
    
    return {
      division: authState.user.division_id ? { 
        id: authState.user.division_id,
        name: authState.user.division_name || 'Division' 
      } : null,
      department: authState.user.department_id ? { 
        id: authState.user.department_id,
        name: authState.user.department_name || 'Department' 
      } : null,
    };
  };

  const getAccessibleDivisions = () => {
    // This will be populated from API in Phase 3
    return [];
  };

  const getAccessibleDepartments = () => {
    // This will be populated from API in Phase 3
    return [];
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        getUserScope,
        getAccessibleDivisions,
        getAccessibleDepartments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};