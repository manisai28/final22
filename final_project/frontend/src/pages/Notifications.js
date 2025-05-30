import React, { useState, useEffect } from 'react';
import { FiBell, FiYoutube, FiClock, FiChevronRight } from 'react-icons/fi';
import { userApi } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';

const Notifications = () => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await userApi.getNotifications(limit, page * limit);
      const newNotifications = response.data.notifications;
      
      if (newNotifications.length < limit) {
        setHasMore(false);
      }
      
      if (page === 0) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchNotifications();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'subscribers':
        return <FiYoutube className="text-red-500" />;
      case 'likes':
        return <FiYoutube className="text-red-500" />;
      case 'views':
        return <FiYoutube className="text-red-500" />;
      case 'shares':
        return <FiYoutube className="text-red-500" />;
      default:
        return <FiBell className="text-blue-500" />;
    }
  };

  const getNotificationTitle = (notification) => {
    const { type, milestone, video_title } = notification;
    
    switch (type) {
      case 'subscribers':
        return `${milestone} subscribers milestone reached!`;
      case 'likes':
        return `${milestone} likes milestone reached!`;
      case 'views':
        return `${milestone} views milestone reached!`;
      case 'shares':
        return `${milestone} shares milestone reached!`;
      default:
        return 'New notification';
    }
  };

  const getNotificationDescription = (notification) => {
    const { type, video_title } = notification;
    
    return `Your video "${video_title}" has reached a new ${type} milestone.`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <FiBell className="inline-block mr-2" /> Notification History
      </h1>
      
      <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {notifications.length === 0 && !loading ? (
          <div className="p-8 text-center">
            <FiBell className={`text-5xl mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className="text-xl font-medium mb-2">No notifications yet</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              When your YouTube videos reach engagement milestones, you'll see notifications here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification, index) => (
              <li 
                key={notification._id || index} 
                className={`p-4 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getNotificationTitle(notification)}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getNotificationDescription(notification)}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <FiClock className="mr-1" />
                      <span>{formatDate(notification.created_at)}</span>
                    </div>
                  </div>
                  
                  <FiChevronRight className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {hasMore && (
          <div className="p-4 text-center">
            <button
              className={`px-4 py-2 rounded-lg ${darkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-colors`}
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
