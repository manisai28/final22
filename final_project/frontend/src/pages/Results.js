import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiBarChart2, FiVideo, FiFileText, FiTag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { videoApi } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const Results = () => {
  const { videoId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('keywords');
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchVideoData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data for video ID:', videoId);
      
      // First try to get the specific video details
      try {
        const videoResponse = await videoApi.getVideoDetails(videoId);
        console.log('Video details response:', videoResponse.data);
        setVideoData(videoResponse.data);
        
        // Get keywords and rankings if available
        if (videoResponse.data.keywords_id) {
          try {
            const rankingsResponse = await videoApi.getRankings(videoResponse.data.keywords_id);
            console.log('Rankings response:', rankingsResponse.data);
            
            if (rankingsResponse.data.keywords) {
              setKeywords(rankingsResponse.data.keywords);
            }
            
            if (rankingsResponse.data.rankings) {
              setRankings(rankingsResponse.data.rankings);
            }
          } catch (rankingsError) {
            console.error('Error fetching rankings:', rankingsError);
          }
        }
      } catch (videoError) {
        console.error('Error fetching video details, trying history:', videoError);
        
        // Fallback to getting from history
        const historyResponse = await videoApi.getHistory();
        const history = historyResponse.data.history || [];
        
        // Find the video by ID
        const video = history.find(v => v._id === videoId || v.video_id === videoId);
        
        if (!video) {
          toast.error('Video not found');
          return;
        }
        
        setVideoData(video);
        
        // Get keywords and rankings
        if (video.keywords && video.keywords.length > 0) {
          setKeywords(video.keywords);
        }
        
        if (video.rankings && video.rankings.length > 0) {
          setRankings(video.rankings);
        }
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      toast.error('Failed to fetch video data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!rankings.length) return;
    
    // Create CSV content
    const headers = ['Keyword', 'Rank', 'Search Volume', 'Competition'];
    const rows = rankings.map(r => [
      r.keyword,
      r.rank,
      r.search_volume || 'N/A',
      r.competition || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo_keywords_${videoId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-2">
            <FiArrowLeft className="mr-1" /> Back to Dashboard
          </Link>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {videoData.title}
          </h1>
        </div>
        
        <button
          onClick={exportToCSV}
          className={`px-4 py-2 rounded-md font-medium mt-4 md:mt-0 ${
            darkMode 
              ? 'bg-primary-600 hover:bg-primary-700 text-white' 
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
          disabled={!rankings.length}
        >
          <FiDownload className="inline mr-2" /> Export Results
        </button>
      </div>
      
      {/* Video Info Card */}
      <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-secondary-700' : 'bg-primary-100'}`}>
              <FiVideo className="text-xl text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Video</h3>
              <p className="text-lg font-semibold">{videoData.filename || videoData.title}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-secondary-700' : 'bg-primary-100'}`}>
              <FiTag className="text-xl text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Keywords</h3>
              <p className="text-lg font-semibold">{keywords.length}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`p-3 rounded-full mr-4 ${darkMode ? 'bg-secondary-700' : 'bg-primary-100'}`}>
              <FiBarChart2 className="text-xl text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rank</h3>
              <p className="text-lg font-semibold">
                {rankings.length > 0
                  ? (rankings.reduce((sum, r) => sum + (r.rank || 0), 0) / rankings.length).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
        <div className="border-b mb-6 pb-2 flex">
          <button
            className={`mr-6 pb-2 font-medium ${
              activeTab === 'keywords'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
            onClick={() => setActiveTab('keywords')}
          >
            Keywords
          </button>
          <button
            className={`mr-6 pb-2 font-medium ${
              activeTab === 'rankings'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
            onClick={() => setActiveTab('rankings')}
          >
            Rankings
          </button>
          <button
            className={`pb-2 font-medium ${
              activeTab === 'text'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
            }`}
            onClick={() => setActiveTab('text')}
          >
            Extracted Text
          </button>
        </div>
        
        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Generated Keywords</h2>
            
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-4 p-4">
                {keywords.map((keyword, index) => {
                  // Ensure keyword is a string and split if needed
                  const keywordStr = String(keyword?.keyword || keyword || '');
                  const words = keywordStr.length > 0 ? keywordStr.split(/(?=[A-Z])|(?<=\w)(?=\d)/g).join(' ') : '';
                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg ${darkMode ? 'bg-secondary-700' : 'bg-gray-100'} shadow-sm hover:shadow-md transition-all duration-200 text-center`}
                    >
                      <span className="text-lg whitespace-normal break-words">{words || keywordStr}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No keywords generated yet.
              </p>
            )}
          </div>
        )}
        
        {/* Rankings Tab */}
        {activeTab === 'rankings' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Keyword Rankings</h2>
            
            {rankings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="py-2 px-4 text-left">Keyword</th>
                      <th className="py-2 px-4 text-left">Rank</th>
                      <th className="py-2 px-4 text-left">Search Volume</th>
                      <th className="py-2 px-4 text-left">Competition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankings.map((ranking, index) => (
                      <tr 
                        key={index}
                        className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <td className="py-3 px-4">{ranking.keyword}</td>
                        <td className="py-3 px-4">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ranking.rank <= 10
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : ranking.rank <= 30
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {ranking.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">{ranking.search_volume || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {ranking.competition ? (
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-primary-600 h-2.5 rounded-full" 
                                style={{ width: `${ranking.competition * 100}%` }}
                              ></div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No rankings available yet.
              </p>
            )}
          </div>
        )}
        
        {/* Text Tab */}
        {activeTab === 'text' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
            
            {videoData.extracted_text ? (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-secondary-700' : 'bg-gray-100'} max-h-96 overflow-y-auto`}>
                <p className="whitespace-pre-line">{videoData.extracted_text}</p>
              </div>
            ) : (
              <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No text has been extracted from this video yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
