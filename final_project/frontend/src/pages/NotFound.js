import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh] animate-fadeIn">
      <FiAlertTriangle className={`text-8xl mb-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
      
      <h1 className={`text-4xl md:text-5xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        404 - Page Not Found
      </h1>
      
      <p className={`text-lg mb-8 text-center max-w-md ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link 
        to="/" 
        className={`px-6 py-3 rounded-md flex items-center font-medium ${
          darkMode 
            ? 'bg-primary-600 hover:bg-primary-700 text-white' 
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        }`}
      >
        <FiHome className="mr-2" /> Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
