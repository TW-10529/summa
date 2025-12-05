import axios from 'axios';

// Vite uses import.meta.env, not process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });
        
        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const { access_token, refresh_token, user } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  },
  
  logout: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// User service
export const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/api/v1/users', { params });
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/api/v1/users', userData);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/v1/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/api/v1/users/${userId}`);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/v1/users/me');
    return response.data;
  },
  
  // NEW: Update user role and assignment
  updateUserRole: async (userId, roleData) => {
    const response = await api.put(`/api/v1/users/${userId}/role`, roleData);
    return response.data;
  }
};

// Division service
export const divisionService = {
  getDivisions: async () => {
    const response = await api.get('/api/v1/divisions');
    return response.data;
  },
  updateDivision: async (divisionId, divisionData) => {
    const response = await api.put(`/api/v1/divisions/${divisionId}`, divisionData);
    return response.data;
  },
  deleteDivision: async (divisionId) => {
    const response = await api.delete(`/api/v1/divisions/${divisionId}`);
    return response.data;
  },
  assignManager: async (divisionId, userId) => {
    const response = await api.put(`/api/v1/divisions/${divisionId}/manager`, { manager_id: userId });
    return response.data;
  },
  createDivision: async (divisionData) => {
    const response = await api.post('/api/v1/divisions', divisionData);
    return response.data;
  }
};

// Department service
export const departmentService = {
  getDepartments: async (divisionId = null) => {
    const params = divisionId ? { division_id: divisionId } : {};
    const response = await api.get('/api/v1/departments', { params });
    return response.data;
  },
  
  createDepartment: async (departmentData) => {
    const response = await api.post('/api/v1/departments', departmentData);
    return response.data;
  },
  
  assignManager: async (departmentId, userId) => {
    const response = await api.put(`/api/v1/departments/${departmentId}/manager`, { manager_id: userId });
    return response.data;
  },
  updateDepartment: async (departmentId, departmentData) => {
    const response = await api.put(`/api/v1/departments/${departmentId}`, departmentData);
    return response.data;
  },
  deleteDepartment: async (departmentId) => {
    const response = await api.delete(`/api/v1/departments/${departmentId}`);
    return response.data;
  },
  getDepartment: async (departmentId) => {
    const response = await api.get(`/api/v1/departments/${departmentId}`);
    return response.data;
  }
};

export default api;