import axios from 'axios';
import { API_URL } from '../config';

// Create axios instances with default configs
const createAxiosInstance = (timeout = 30000) => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create a default instance
export const defaultInstance = createAxiosInstance();

// Auth API
const authApi = {
  login: (formData) => {
    const instance = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // Convert FormData to URLSearchParams for proper encoding
    const params = new URLSearchParams();
    if (formData instanceof FormData) {
      for (const pair of formData.entries()) {
        params.append(pair[0], pair[1]);
      }
    } else if (typeof formData === 'object') {
      params.append('username', formData.email || '');
      params.append('password', formData.password || '');
    }
    
    console.log('Login request params:', params.toString());
    return instance.post('/auth/login', params);
  },
  
  signup: (data) => {
    return defaultInstance.post('/auth/signup', data);
  },
  
  verify: () => {
    return defaultInstance.get('/auth/verify');
  },
  
  updateProfile: (data) => {
    return defaultInstance.put('/auth/profile', data);
  },
};

// Video API
const videoApi = {
  uploadVideo: (formData) => {
    return defaultInstance.post('/upload/video', formData, {
      timeout: 120000, // 2 minute timeout for uploads
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
  },
  
  extractText: (videoId) => {
    return defaultInstance.post(`/extract/text/${videoId}`, {}, {
      timeout: 60000 // 1 minute timeout
    });
  },
  
  generateKeywords: (videoId) => {
    return defaultInstance.post(`/generate/keywords/${videoId}`, {}, {
      timeout: 60000 // 1 minute timeout
    });
  },
  
  getKeywords: (keywordId) => {
    return defaultInstance.get(`/keywords/${keywordId}`);
  },
  
  getRankings: (keywordId) => {
    // Handle potential API inconsistencies
    if (!keywordId) {
      console.error('No keyword ID provided for rankings');
      return Promise.reject(new Error('No keyword ID provided'));
    }
    
    return defaultInstance.post(`/ranking/${keywordId}`);
  },
  
  getHistory: () => {
    return defaultInstance.get('/history');
  },
  
  getVideoDetails: (videoId) => {
    return defaultInstance.get(`/video/${videoId}`);
  },
};

const youtubeApi = {
  getAuthUrl: () => defaultInstance.get('/youtube/auth'),
  handleCallback: (code, state) => defaultInstance.get('/youtube/callback', { params: { code, state } }),
  getStatus: () => defaultInstance.get('/youtube/status'),
  upload: (videoId, data) => defaultInstance.post(`/youtube/upload/${videoId}`, data)
};

// User API functions
export const userApi = {
  getProfile: () => defaultInstance.get('/user/profile'),
  updateProfile: (data) => defaultInstance.put('/user/profile', data),
  updateNotificationPreferences: (data) => defaultInstance.put('/user/notification-preferences', data),
  getNotifications: (limit = 10, skip = 0) => {
    return defaultInstance.get(`/user/notifications?limit=${limit}&skip=${skip}`);
  },
  uploadProfileImage: (formData) => {
    return defaultInstance.post('/user/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteAccount: () => defaultInstance.delete('/user/account'),
  connectYoutube: (accessToken) => defaultInstance.post('/user/youtube-connect', { access_token: accessToken })
};

// Export all API functions
export { authApi, videoApi, youtubeApi };
