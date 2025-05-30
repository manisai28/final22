import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiBarChart2, FiUser, FiLogOut, FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/TranslationContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 shadow-md ${darkMode ? 'bg-secondary-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg
                className={`w-8 h-8 ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className={`ml-2 font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {t('title')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <FiHome className="inline mr-1" /> {t('dashboard')}
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <FiUser className="inline mr-1" /> {t('profile')}
                </Link>
                <Link
                  to="/analytics"
                  className={`nav-link ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <FiBarChart2 className="inline mr-1" /> Analytics
                </Link>
                <button
                  onClick={handleLogout}
                  className={`nav-link ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  <FiLogOut className="inline mr-1" /> {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                  {t('login')}
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className={`p-2 mr-2 rounded-full ${
                darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${darkMode ? 'text-white' : 'text-gray-800'}`}
            >
              {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`md:hidden ${darkMode ? 'bg-secondary-800' : 'bg-white'} shadow-lg animate-slideInFromTop`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md ${
                    darkMode ? 'text-white hover:bg-secondary-700' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHome className="inline mr-2" /> Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`block px-3 py-2 rounded-md ${
                    darkMode ? 'text-white hover:bg-secondary-700' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser className="inline mr-2" /> Profile
                </Link>
                <Link
                  to="/analytics"
                  className={`block px-3 py-2 rounded-md ${
                    darkMode ? 'text-white hover:bg-secondary-700' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiBarChart2 className="inline mr-2" /> Analytics
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    darkMode ? 'text-white hover:bg-secondary-700' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <FiLogOut className="inline mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md ${
                    darkMode ? 'text-white hover:bg-secondary-700' : 'text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`block px-3 py-2 rounded-md ${
                    darkMode
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
