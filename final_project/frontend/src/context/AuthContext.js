import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import jwt_decode from 'jwt-decode';
import { authApi } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
        } else {
          // Set user from token
          setUser({
            id: decoded.sub,
            username: localStorage.getItem('username'),
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      
      // Create login data object
      const loginData = {
        email: email,
        password: password
      };
      
      const response = await authApi.login(loginData);
      console.log('Login response:', response.data);
      
      // Save token and user info
      const newToken = response.data.access_token;
      localStorage.setItem('token', newToken);
      localStorage.setItem('username', response.data.username);
      setToken(newToken);
      
      // Set user state
      setUser({
        id: response.data.user_id,
        username: response.data.username,
      });
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 422) {
          toast.error('Invalid login format. Please check your email and password.');
        } else if (error.response.status === 401) {
          toast.error('Invalid credentials. Please check your email and password.');
        } else {
          toast.error(error.response.data?.detail || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Login failed. Please try again later.');
      }
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const userData = {
        username,
        email,
        password,
      };

      console.log('Sending signup request with data:', userData);
      console.log('Using direct API to backend at http://localhost:8000/auth/signup');
      
      // eslint-disable-next-line no-unused-vars
      const response = await authApi.signup(userData);
      console.log('Signup successful, response:', response);
      
      toast.success('Signup successful! Please login.');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.');
      } else if (error.response) {
        console.error('Error response data:', error.response.data);
        toast.error(error.response.data?.detail || 'Signup failed. Please try again.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Signup failed. Please try again later.');
      }
      
      return false;
    }
  };

  const logout = () => {
    // Remove token 
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  };

  const updateProfile = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Not authenticated');
      }
      
      const response = await authApi.updateProfile(userData);
      
      // Update user state with new data
      setUser(prevUser => ({
        ...prevUser,
        ...response.data.user
      }));
      
      return response.data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    token,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
