// src/services/auth.js
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const authAPI = {
  login: async (credentials) => {
    try {
      const { username, password } = credentials;
      
      // Use FormData for FastAPI compatibility
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens in new format (compatible with api.js)
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('factory_user', JSON.stringify(data.user));
      localStorage.setItem('factory_role', data.user.role);
      
      return {
        success: true,
        token: data.access_token,
        user: data.user
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear both old and new token formats
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('factory_user');
      localStorage.removeItem('factory_role');
      localStorage.removeItem('factory_division');
      localStorage.removeItem('factory_department');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('factory_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    // Check for both old and new token formats
    return !!localStorage.getItem('access_token') || !!localStorage.getItem('token');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const oldToken = localStorage.getItem('token');
    
    if (!refreshToken && !oldToken) return null;

    try {
      // Try new format first
      if (refreshToken) {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          return data.access_token;
        }
      }
      
      // Fallback to old format if new fails
      if (oldToken) {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${oldToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          return data.access_token;
        }
      }
      
      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Refresh token failed:', error);
      return null;
    }
  },
};