// components/auth/Login.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    console.log('Submitting login form...');
    console.log('Username:', formData.username);

    try {
      // Call the AuthContext login function
      const result = await login(formData.username, formData.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      console.log('Login successful! User:', result.user);
      
      // Force page reload to initialize app properly
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Division Manager', username: 'division', password: 'division123' },
    { role: 'Department Manager', username: 'dept', password: 'dept123' },
    { role: 'Employee', username: 'employee', password: 'employee123' },
  ];

  const fillDemoCredentials = (username, password) => {
    setFormData({ username, password });
  };

  // Combine auth error and local error
  const error = authError || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">FactoryShift</h1>
          <p className="text-gray-600 mt-2">Division-Based Attendance & Shift Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm mb-3">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2">
                {demoCredentials.map((cred, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => fillDemoCredentials(cred.username, cred.password)}
                    className="py-2 px-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {cred.role}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 FactoryShift. All rights reserved.</p>
          <p className="mt-1">Division-Based Factory Management System</p>
        </div>
      </div>
    </div>
  );
};

export default Login;