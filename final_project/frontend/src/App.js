import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Results from './pages/Results';
import Notifications from './pages/Notifications';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Tutorial from './components/Tutorial';
import TutorialButton from './components/TutorialButton';
import Analytics from './components/Analytics';

// Context
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { TranslationProvider } from './context/TranslationContext';
import { TutorialProvider } from './context/TutorialContext';

function App() {
  const { loading } = useAuth();
  const { darkMode } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="787860577113-ebb47tf066fa5bqvi6mculc8g528oglp.apps.googleusercontent.com">
      <TranslationProvider>
        <TutorialProvider>
        <div className={darkMode ? 'dark bg-secondary-900 text-white' : 'bg-gray-50 text-gray-900'}>
          <Navbar />
          <div className="pt-16 min-h-screen">
            <div className="fixed bottom-4 right-4 z-50">
              <TutorialButton />
            </div>
            <Tutorial />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/results/:videoId" 
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } 
              />
                <Route 
    path="/analytics" 
    element={
      <ProtectedRoute>
        <Analytics />
      </ProtectedRoute>
    } 
  />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={darkMode ? 'dark' : 'light'}
          />
        </div>
      </TutorialProvider>
    </TranslationProvider>
  </GoogleOAuthProvider>
  );
}

export default App;
