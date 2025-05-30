import React from 'react';
import { Link } from 'react-router-dom';
import { FiVideo, FiSearch, FiBarChart2, FiTrendingUp } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiVideo className="text-4xl text-primary-500" />,
      title: 'Video Upload',
      description: 'Upload your videos securely to our platform for analysis.'
    },
    {
      icon: <FiSearch className="text-4xl text-primary-500" />,
      title: 'Text Extraction',
      description: 'Extract text from your videos using advanced speech recognition technology.'
    },
    {
      icon: <FiBarChart2 className="text-4xl text-primary-500" />,
      title: 'Keyword Generation',
      description: 'Generate relevant SEO keywords using AI-powered analysis.'
    },
    {
      icon: <FiTrendingUp className="text-4xl text-primary-500" />,
      title: 'SEO Ranking',
      description: 'Get insights on keyword rankings to optimize your video content.'
    }
  ];

  return (
    <div className={`animate-fadeIn ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-primary-600">Video SEO Analysis</span> System
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Optimize your video content with AI-powered SEO analysis. Extract text, generate keywords, and get ranking insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary text-lg px-8 py-3">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline text-lg px-8 py-3">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-12 ${darkMode ? 'bg-secondary-800' : 'bg-gray-100'} rounded-lg`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`card ${darkMode ? 'bg-secondary-700 hover:bg-secondary-600' : 'bg-white hover:shadow-lg'} transition-all duration-300`}
              >
                <div className="text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold mt-4 mb-2">{feature.title}</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className={`max-w-3xl mx-auto ${darkMode ? 'bg-secondary-700' : 'bg-primary-50'} rounded-xl p-8`}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to optimize your video content?</h2>
          <p className="mb-6 opacity-90">
            Join now and start improving your video SEO with our advanced analysis tools.
          </p>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/signup" className="btn btn-primary text-lg px-8 py-3">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-12 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            &copy; {new Date().getFullYear()} Video SEO Analysis System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
