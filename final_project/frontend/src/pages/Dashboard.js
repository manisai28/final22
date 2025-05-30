import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiUpload, FiVideo, FiClock, FiCheck, FiList, FiPlay, FiInfo, FiYoutube, FiExternalLink, FiAward, FiBookOpen, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { videoApi, authApi, youtubeApi } from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/TranslationContext';
import { useTutorial } from '../context/TutorialContext';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [processingVideo, setProcessingVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'history', 'hosting', 'certificates', or 'content'
  const [contentIdea, setContentIdea] = useState('');
  const [generatingIdea, setGeneratingIdea] = useState(false);
  const [certificateType, setCertificateType] = useState('milestone');
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [uploadingToYoutube, setUploadingToYoutube] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check token validity
    const checkToken = async () => {
      try {
        await authApi.verify();
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    
    checkToken();
    fetchVideos();
    checkYoutubeStatus();

    // Check if redirected from YouTube OAuth
    const params = new URLSearchParams(location.search);
    
    // Handle YouTube OAuth callback
    const code = params.get('code');
    const state = params.get('state');
    
    if (code && state) {
      // We have an OAuth callback from Google
      console.log('Received OAuth callback with code and state');
      handleYoutubeCallback(code, state);
    } else if (params.get('youtube_connected') === 'true') {
      toast.success('YouTube account connected successfully!');
      setActiveTab('hosting');
      checkYoutubeStatus();
    } else if (params.get('youtube_error') === 'true') {
      toast.error('Failed to connect YouTube account. Please try again.');
    }
  }, [navigate, location]);

  // Handle YouTube OAuth callback
  const handleYoutubeCallback = async (code, state) => {
    try {
      setYoutubeLoading(true);
      // Call backend to exchange code for tokens
      const response = await youtubeApi.handleCallback(code, state);
      
      if (response.data.success) {
        toast.success('YouTube account connected successfully!');
        setYoutubeConnected(true);
        setActiveTab('hosting');
      } else {
        toast.error(response.data.error || 'Failed to connect YouTube account');
      }
    } catch (error) {
      console.error('Error handling YouTube callback:', error);
      toast.error('Failed to connect YouTube account. Please try again.');
    } finally {
      setYoutubeLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      console.log('Fetching videos from history...');
      const response = await videoApi.getHistory();
      console.log('History response:', response.data);
      
      if (response.data && response.data.history) {
        setVideos(response.data.history);
      } else {
        console.error('Invalid history response:', response.data);
        toast.error('Failed to load videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const checkYoutubeStatus = async () => {
    try {
      setYoutubeLoading(true);
      const response = await youtubeApi.getStatus();
      setYoutubeConnected(response.data.connected);
    } catch (error) {
      console.error('Error checking YouTube status:', error);
    } finally {
      setYoutubeLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      // Auto-set title from filename if not set
      if (!videoTitle) {
        const fileName = file.name.split('.').slice(0, -1).join('.');
        setVideoTitle(fileName);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('file', videoFile);
      
      console.log('Uploading video:', videoTitle);
      const response = await videoApi.uploadVideo(formData);
      console.log('Upload response:', response.data);
      
      toast.success('Video uploaded successfully');
      
      // Reset form
      setVideoTitle('');
      setVideoFile(null);
      
      // Set processing video
      setProcessingVideo(response.data);
      
      // Refresh videos list
      fetchVideos();
      
      // Switch to history tab
      setActiveTab('history');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const processVideo = async (videoId) => {
    try {
      // Set processing state
      setProcessingVideo({
        id: videoId,
        step: 'extracting'
      });
      
      console.log('Starting text extraction for video:', videoId);
      
      // Step 1: Extract text
      const extractResponse = await videoApi.extractText(videoId);
      console.log('Text extraction response:', extractResponse.data);
      
      if (!extractResponse.data || !extractResponse.data.video_id) {
        throw new Error('Failed to extract text from video');
      }
      
      // Update processing state
      setProcessingVideo({
        id: videoId,
        step: 'generating'
      });
      
      // Step 2: Generate keywords
      console.log('Starting keyword generation for video:', videoId);
      const keywordResponse = await videoApi.generateKeywords(videoId);
      console.log('Keyword generation response:', keywordResponse.data);
      
      if (!keywordResponse.data || !keywordResponse.data.keyword_id) {
        throw new Error('Failed to generate keywords');
      }
      
      const keywordId = keywordResponse.data.keyword_id;
      
      // Update processing state
      setProcessingVideo({
        id: videoId,
        step: 'ranking'
      });
      
      // Step 3: Get rankings
      console.log('Starting ranking retrieval for keywords:', keywordId);
      const rankingResponse = await videoApi.getRankings(keywordId);
      console.log('Ranking response:', rankingResponse.data);
      
      // Reset processing state and refresh videos
      setProcessingVideo(null);
      fetchVideos();
      
      toast.success('Video processed successfully!');
    } catch (error) {
      console.error('Error processing video:', error);
      setProcessingVideo(null);
      toast.error(error.message || 'Failed to process video');
    }
  };

  const connectYoutube = async () => {
    try {
      setYoutubeLoading(true);
      const response = await youtubeApi.getAuthUrl();
      // Redirect to Google OAuth page
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error getting YouTube auth URL:', error);
      toast.error('Failed to connect to YouTube. Please try again.');
      setYoutubeLoading(false);
    }
  };

  const uploadToYoutube = async (videoId, title) => {
    try {
      setUploadingToYoutube({ videoId, status: 'uploading' });
      
      // Get keywords for this video if available
      const video = videos.find(v => v._id === videoId);
      let keywords = [];
      
      if (video && video.keywords_id) {
        try {
          const keywordsResponse = await videoApi.getKeywords(video.keywords_id);
          console.log('Keywords response:', keywordsResponse.data);
          if (keywordsResponse.data && keywordsResponse.data.keywords) {
            // Handle different keyword formats
            if (Array.isArray(keywordsResponse.data.keywords)) {
              if (keywordsResponse.data.keywords.length > 0) {
                if (typeof keywordsResponse.data.keywords[0] === 'string') {
                  // Format: ["keyword1", "keyword2", ...]
                  keywords = keywordsResponse.data.keywords;
                } else if (typeof keywordsResponse.data.keywords[0] === 'object' && keywordsResponse.data.keywords[0].keyword) {
                  // Format: [{"keyword": "value", ...}, ...]
                  keywords = keywordsResponse.data.keywords.map(k => k.keyword);
                }
              }
            }
          }
        } catch (error) {
          console.warn('Could not fetch keywords for video:', error);
        }
      }
      
      // Prepare data for upload
      const uploadData = {
        title: title || 'Untitled Video',
        description: `Video analyzed with SEO keywords: ${keywords.slice(0, 5).join(', ') || 'SEO optimized content'}`,
        tags: keywords,
        privacy_status: 'private' // Default to private for safety
      };
      
      console.log('Uploading video to YouTube with data:', uploadData);
      const response = await youtubeApi.upload(videoId, uploadData);
      
      if (response.data && response.data.success) {
        toast.success('Video uploaded to YouTube successfully!');
        
        // Format tags with spaces between them
        const formattedTags = response.data.youtube_tags.join(', ');
        
        // Create copy functions
        const copyToClipboard = (text) => {
          navigator.clipboard.writeText(text)
            .then(() => toast.success('Copied to clipboard!'))
            .catch(err => toast.error('Failed to copy: ' + err));
        };
        
        // Show metadata to user with copy buttons and video link
        const metadataMessage = `
          <div style="font-size: 14px; line-height: 1.5; background-color: #fff; padding: 15px; border-radius: 8px; color: #000;">
            <strong style="font-size: 18px; color: #1a202c; display: block; margin-bottom: 15px; text-align: center;">Video Uploaded Successfully!</strong>
            
            <div style="margin-bottom: 15px; text-align: center;">
              <a href="${response.data.youtube_url}" target="_blank" style="display: inline-block; background: #ff0000; color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-weight: bold;">
                <span style="margin-right: 5px;">🎥</span> View on YouTube
              </a>
            </div>
            
            <div style="margin-bottom: 5px;">
              <strong style="color: #000; font-size: 16px; background-color: #4299e1; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-bottom: 5px;">TITLE</strong>
              <button id="copy-title" class="copy-btn" style="background: #38b2ac; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; float: right;">Copy</button>
            </div>
            <div style="clear: both;"></div>
            <div style="background: #edf2f7; padding: 10px; border-radius: 4px; margin-bottom: 20px; word-break: break-word; border: 1px solid #cbd5e0; color: #2d3748;">${response.data.youtube_title}</div>
            
            <div style="margin-bottom: 5px;">
              <strong style="color: #000; font-size: 16px; background-color: #4299e1; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-bottom: 5px;">DESCRIPTION</strong>
              <button id="copy-desc" class="copy-btn" style="background: #38b2ac; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; float: right;">Copy</button>
            </div>
            <div style="clear: both;"></div>
            <div style="background: #edf2f7; padding: 10px; border-radius: 4px; margin-bottom: 20px; word-break: break-word; border: 1px solid #cbd5e0; color: #2d3748;">${response.data.youtube_description}</div>
            
            <div style="margin-bottom: 5px;">
              <strong style="color: #000; font-size: 16px; background-color: #4299e1; color: white; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-bottom: 5px;">TAGS</strong>
              <button id="copy-tags" class="copy-btn" style="background: #38b2ac; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; float: right;">Copy</button>
            </div>
            <div style="clear: both;"></div>
            <div style="background: #edf2f7; padding: 10px; border-radius: 4px; word-break: break-word; border: 1px solid #cbd5e0; color: #2d3748;">${formattedTags}</div>
          </div>
        `;
        
        toast.success(
          <div dangerouslySetInnerHTML={{ __html: metadataMessage }} />,
          {
            autoClose: false,
            closeOnClick: false,
            position: "top-center",
            hideProgressBar: false,
            closeButton: true,
            draggable: true,
            style: { background: "#fff", color: "#000", maxWidth: "500px", width: "100%" },
            onOpen: () => {
              // Add event listeners to copy buttons after toast is rendered
              setTimeout(() => {
                document.getElementById('copy-title')?.addEventListener('click', () => 
                  copyToClipboard(response.data.youtube_title));
                document.getElementById('copy-desc')?.addEventListener('click', () => 
                  copyToClipboard(response.data.youtube_description));
                document.getElementById('copy-tags')?.addEventListener('click', () => 
                  copyToClipboard(formattedTags));
              }, 100);
            }
          }
        );
        
        setUploadingToYoutube({ videoId, status: 'uploaded' });
        
        // Refresh videos list to update YouTube status
        fetchVideos();
      } else {
        throw new Error('Upload failed: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading to YouTube:', error);
      setUploadingToYoutube({ videoId, status: 'failed' });
      toast.error(`Failed to upload to YouTube: ${error.response?.data?.detail || error.message}`);
    }
  };

  const { isTutorialMode } = useTutorial();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('videoSeoDashboard')}</h1>
      </div>
      
      {/* Tutorial Sections - Only visible during tutorial */}
      {isTutorialMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" aria-hidden="true">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-20 px-4">
            <div id="keyword-section" className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 text-white keyword-section">
              <h3 className="text-xl font-semibold mb-2">Keyword Analysis</h3>
              <p className="opacity-90">Optimize your video keywords</p>
            </div>
            <div id="analytics-section" className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 text-white analytics-section">
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="opacity-90">Track performance metrics</p>
            </div>
            <div id="notification-section" className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 text-white notification-section">
              <h3 className="text-xl font-semibold mb-2">Notifications</h3>
              <p className="opacity-90">Stay updated with alerts</p>
            </div>
          </div>
        </div>
      )}
      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'upload'
              ? `${darkMode ? 'text-primary-400 border-primary-400' : 'text-primary-600 border-primary-600'} border-b-2`
              : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('upload')}
        >
          <FiUpload className="inline mr-2" /> {t('uploadVideo')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? `${darkMode ? 'text-primary-400 border-primary-400' : 'text-primary-600 border-primary-600'} border-b-2`
              : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('history')}
        >
          <FiClock className="inline mr-2" /> {t('videoHistory')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'hosting'
              ? `${darkMode ? 'text-primary-400 border-primary-400' : 'text-primary-600 border-primary-600'} border-b-2`
              : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('hosting')}
        >
          <FiYoutube className="inline mr-2" /> {t('hosting')}
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'certificates'
              ? `${darkMode ? 'text-primary-400 border-primary-400' : 'text-primary-600 border-primary-600'} border-b-2`
              : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('certificates')}
        >
          <FiAward className="inline mr-2" /> Certificates
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'content'
              ? `${darkMode ? 'text-primary-400 border-primary-400' : 'text-primary-600 border-primary-600'} border-b-2`
              : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
          }`}
          onClick={() => setActiveTab('content')}
        >
          <FiBookOpen className="inline mr-2" /> Content Ideas
        </button>
      </div>
      
      {/* Upload Section */}
      {activeTab === 'upload' && (
        <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <form onSubmit={handleUpload}>
            <div className="mb-4">
              <label htmlFor="videoTitle" className="label">
                {t('videoTitle')}
              </label>
              <input
                id="videoTitle"
                type="text"
                className={`w-full p-2 rounded border ${
                  darkMode ? 'bg-secondary-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                placeholder={t('enterVideoTitle')}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="videoFile" className="label">
                {t('chooseFile')}
              </label>
              <div className={`relative border-2 border-dashed rounded-md p-6 text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                {videoFile ? (
                  <div className="text-center">
                    <p className="mb-2">{videoFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-red-500 hover:text-red-600"
                      onClick={() => setVideoFile(null)}
                    >
                      {t('remove')}
                    </button>
                  </div>
                ) : (
                  <div>
                    <FiUpload className="mx-auto text-3xl mb-2 text-gray-400" />
                    <p className="mb-2">{t('dragAndDrop')}</p>
                    <p className="text-sm text-gray-500">
                      {t('supportedFormats')} (max 50MB)
                    </p>
                  </div>
                )}
                <input
                  id="videoFile"
                  type="file"
                  className={videoFile ? 'hidden' : 'absolute inset-0 w-full h-full opacity-0 cursor-pointer'}
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded font-medium ${
                darkMode 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
              disabled={uploading}
            >
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  {t('uploading')}...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiUpload className="inline mr-1" /> {t('uploadVideo')}
                </div>
              )}
            </button>
          </form>
        </div>
      )}
      
      {/* History Section */}
      {activeTab === 'history' && (
        <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('videoHistory')}</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : videos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="px-4 py-2">{t('dateUploaded')}</th>
                    <th className="px-4 py-2">{t('videoTitle')}</th>
                    <th className="px-4 py-2">{t('status')}</th>
                    <th className="px-4 py-2">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr 
                      key={video._id || video.video_id} 
                      className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${
                        processingVideo && processingVideo.id === video._id ? 
                          (darkMode ? 'bg-secondary-700' : 'bg-blue-50') : ''
                      }`}
                    >
                      <td className="py-3 px-4">{new Date(video.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4">{video.title}</td>
                      <td className="py-3 px-4">
                        {processingVideo && processingVideo.id === video._id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                            <span>
                              {processingVideo.step === 'extracting' && t('extractingText')}
                              {processingVideo.step === 'generating' && t('generatingKeywords')}
                              {processingVideo.step === 'ranking' && t('gettingRankings')}
                            </span>
                          </div>
                        ) : (
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {video.keywords_id ? (
                              <span className="flex items-center text-green-500">
                                <FiCheck className="mr-1" /> {t('analyzed')}
                              </span>
                            ) : video.extracted_text ? (
                              <span className="flex items-center text-blue-500">
                                <FiInfo className="mr-1" /> {t('textExtracted')}
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-500">
                                <FiVideo className="mr-1" /> {t('uploaded')}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {processingVideo && processingVideo.id === video._id ? (
                          <span className="text-gray-400">{t('processing')}...</span>
                        ) : video.keywords_id ? (
                          <div className="flex space-x-2">
                            <Link
                              to={`/results/${video._id}`}
                              className={`px-3 py-1 rounded text-sm ${
                                darkMode ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {t('viewResults')}
                            </Link>
                            {youtubeConnected && !video.youtube_uploaded && (
                              <button
                                className={`px-3 py-1 rounded text-sm flex items-center ${
                                  darkMode ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'
                                }`}
                                onClick={() => uploadToYoutube(video._id, video.title)}
                                disabled={uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'uploading'}
                              >
                                {uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'redirecting' ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-current mr-1"></div>
                                    {t('preparing')}...
                                  </>
                                ) : uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'redirected' ? (
                                  <>
                                    <FiExternalLink className="mr-1 text-green-500" /> {t('redirectedToYoutube')}
                                  </>
                                ) : uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'failed' ? (
                                  <>
                                    <FiInfo className="mr-1 text-red-500" /> {t('failed')}
                                  </>
                                ) : (
                                  <>
                                    <FiYoutube className="mr-1" /> {t('uploadToYoutube')}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            className={`px-3 py-1 rounded text-sm ${
                              darkMode ? 'bg-primary-700 text-white' : 'bg-primary-100 text-primary-800'
                            }`}
                            onClick={() => processVideo(video._id)}
                          >
                            <FiPlay className="inline mr-1" /> {t('process')}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiList className="mx-auto text-4xl text-gray-400 mb-2" />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                {t('noVideosUploaded')}
              </p>
              <button
                className={`mt-4 px-4 py-2 rounded-md font-medium flex items-center mx-auto ${
                  darkMode ? 'bg-primary-700 text-white' : 'bg-primary-100 text-primary-800'
                }`}
                onClick={() => setActiveTab('upload')}
              >
                <FiUpload className="inline mr-1" /> {t('uploadYourFirstVideo')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* YouTube Hosting Section */}
      {activeTab === 'hosting' && (
        <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('hosting')}</h2>
          
          {youtubeLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : youtubeConnected ? (
            <div>
              <div className={`p-4 mb-6 rounded-md ${darkMode ? 'bg-green-800 text-white' : 'bg-green-100 text-green-800'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiCheck className="text-2xl mr-3" />
                    <div>
                      <h3 className="font-medium">{t('youtubeAccountConnected')}</h3>
                      <p className="text-sm mt-1">{t('youtubeConnectedDescription')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('https://studio.youtube.com', '_blank')}
                    className={`flex items-center px-4 py-2 rounded-md ${darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors duration-200`}
                  >
                    <FiYoutube className="mr-2" size={20} />
                    {t('openYoutubeStudio')}
                  </button>
                </div>
              </div>
              
              <h3 className="font-medium mb-3">{t('uploadVideosToYoutube')}</h3>
              <p className="mb-4">{t('selectProcessedVideo')}</p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className="py-3 px-4 text-left">{t('videoTitle')}</th>
                      <th className="py-3 px-4 text-left">{t('status')}</th>
                      <th className="py-3 px-4 text-left">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos
                      .filter(video => video.keywords_id && !video.youtube_uploaded)
                      .map((video) => (
                        <tr 
                          key={video._id} 
                          className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <td className="py-3 px-4">{video.title}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center text-green-500">
                              <FiCheck className="mr-1" /> {t('readyForYoutube')}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              className={`px-3 py-1 rounded text-sm flex items-center ${
                                darkMode ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800'
                              }`}
                              onClick={() => uploadToYoutube(video._id, video.title)}
                              disabled={uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'uploading'}
                            >
                              {uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'redirecting' ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-current mr-1"></div>
                                  {t('preparing')}...
                                </>
                              ) : uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'redirected' ? (
                                <>
                                  <FiExternalLink className="mr-1 text-green-500" /> {t('redirectedToYoutube')}
                                </>
                              ) : uploadingToYoutube && uploadingToYoutube.videoId === video._id && uploadingToYoutube.status === 'failed' ? (
                                <>
                                  <FiInfo className="mr-1 text-red-500" /> {t('failed')}
                                </>
                              ) : (
                                <>
                                  <FiYoutube className="mr-1" /> {t('uploadToYoutube')}
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    {videos.filter(video => video.keywords_id && !video.youtube_uploaded).length === 0 && (
                      <tr>
                        <td colSpan="3" className="py-6 text-center">
                          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {t('noVideosReadyForYoutube')}
                          </p>
                          <p className="text-sm mt-2">
                            {t('processVideosFirst')}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {videos.filter(video => video.youtube_uploaded).length > 0 && (
                <div className="mt-8">
                  <h3 className="font-medium mb-3">{t('videosOnYoutube')}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className="py-3 px-4 text-left">{t('videoTitle')}</th>
                          <th className="py-3 px-4 text-left">{t('uploadDate')}</th>
                          <th className="py-3 px-4 text-left">{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos
                          .filter(video => video.youtube_uploaded)
                          .map((video) => (
                            <tr 
                              key={video._id} 
                              className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                              <td className="py-3 px-4">{video.title}</td>
                              <td className="py-3 px-4">
                                {new Date(video.youtube_upload_date || video.updated_at).toLocaleString()}
                              </td>
                              <td className="py-3 px-4">
                                <span className="flex items-center text-red-500">
                                  <FiYoutube className="mr-1" /> {t('uploadedToYoutube')}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiYoutube className="mx-auto text-5xl text-red-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">{t('connectYourYoutubeAccount')}</h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('connectYoutubeDescription')}
              </p>
              
              <button
                className={`px-6 py-3 rounded-md font-medium flex items-center mx-auto ${
                  darkMode ? 'bg-red-700 hover:bg-red-800 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                onClick={connectYoutube}
                disabled={youtubeLoading}
              >
                {youtubeLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    {t('connecting')}...
                  </>
                ) : (
                  <>
                    <FiYoutube className="mr-2 text-xl" /> {t('connectYoutubeAccount')}
                  </>
                )}
              </button>
              
              <p className="mt-4 text-sm text-gray-500">
                {t('youWillBeRedirectedToGoogle')}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'} p-6`}>
          <h2 className="text-2xl font-bold mb-6">{t('achievementCertificates')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 100 Subscribers Certificate */}
            <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-secondary-700 border-secondary-600' : 'bg-white border-gray-200'} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center mb-4">
                <FiAward className="text-3xl mr-3 text-yellow-500" />
                <h3 className="text-xl font-semibold">100 Subscribers</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Achieve 100 subscribers on your YouTube channel to unlock this milestone certificate.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.info('You will receive this certificate when you reach 100 subscribers!')}
                  className={`flex-1 py-2 px-4 rounded-md ${darkMode ? 'bg-primary-700 hover:bg-primary-800' : 'bg-primary-600 hover:bg-primary-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiAward className="mr-2" /> Generate
                </button>
                <button
                  onClick={() => {
                    toast(
                      <div className="relative p-4 bg-white rounded-lg shadow-xl" style={{ maxWidth: '600px' }}>
                        <div className="absolute top-2 right-2">
                          <button onClick={() => toast.dismiss()} className="text-gray-500 hover:text-gray-700">
                            ×
                          </button>
                        </div>
                        <div className="certificate-preview border-8 border-double border-yellow-600 p-8 bg-gradient-to-r from-yellow-50 to-yellow-100">
                          <div className="text-center">
                            <div className="text-3xl font-serif text-yellow-800 mb-4 font-bold">Certificate of Achievement</div>
                            <div className="text-xl mb-8 text-yellow-700">100 Subscribers Milestone</div>
                            <div className="mb-4 text-yellow-900">This is to certify that</div>
                            <div className="text-2xl font-bold mb-4 text-yellow-800">[Channel Name]</div>
                            <div className="mb-8 text-yellow-900">has successfully achieved 100 subscribers on YouTube</div>
                            <div className="text-sm text-yellow-700 mb-4">Awarded on [Date]</div>
                            <div className="flex justify-center mb-4">
                              <FiAward className="text-5xl text-yellow-600" />
                            </div>
                            <div className="text-sm text-yellow-700">SEO Keywords Master - Certificate of Excellence</div>
                          </div>
                        </div>
                      </div>,
                      {
                        autoClose: false,
                        closeButton: false,
                        closeOnClick: false,
                        draggable: false,
                        position: "top-center",
                        style: { background: 'none', boxShadow: 'none', width: '100%', maxWidth: '650px' }
                      }
                    );
                  }}
                  className={`py-2 px-4 rounded-md ${darkMode ? 'bg-yellow-700 hover:bg-yellow-800' : 'bg-yellow-600 hover:bg-yellow-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiEye className="mr-2" /> Preview
                </button>
              </div>
            </div>

            {/* 10,000 Views Certificate */}
            <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-secondary-700 border-secondary-600' : 'bg-white border-gray-200'} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center mb-4">
                <FiAward className="text-3xl mr-3 text-blue-500" />
                <h3 className="text-xl font-semibold">10K Video Views</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get 10,000 views on a single video to earn this prestigious certificate.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.info('You will receive this certificate when one of your videos reaches 10,000 views!')}
                  className={`flex-1 py-2 px-4 rounded-md ${darkMode ? 'bg-primary-700 hover:bg-primary-800' : 'bg-primary-600 hover:bg-primary-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiAward className="mr-2" /> Generate
                </button>
                <button
                  onClick={() => {
                    toast(
                      <div className="relative p-4 bg-white rounded-lg shadow-xl" style={{ maxWidth: '600px' }}>
                        <div className="absolute top-2 right-2">
                          <button onClick={() => toast.dismiss()} className="text-gray-500 hover:text-gray-700">
                            ×
                          </button>
                        </div>
                        <div className="certificate-preview border-8 border-double border-blue-600 p-8 bg-gradient-to-r from-blue-50 to-blue-100">
                          <div className="text-center">
                            <div className="text-3xl font-serif text-blue-800 mb-4 font-bold">Certificate of Achievement</div>
                            <div className="text-xl mb-8 text-blue-700">10,000 Views Milestone</div>
                            <div className="mb-4 text-blue-900">This is to certify that</div>
                            <div className="text-2xl font-bold mb-4 text-blue-800">[Video Title]</div>
                            <div className="mb-8 text-blue-900">has successfully reached 10,000 views on YouTube</div>
                            <div className="text-sm text-blue-700 mb-4">Awarded on [Date]</div>
                            <div className="flex justify-center mb-4">
                              <FiAward className="text-5xl text-blue-600" />
                            </div>
                            <div className="text-sm text-blue-700">SEO Keywords Master - Certificate of Excellence</div>
                          </div>
                        </div>
                      </div>,
                      {
                        autoClose: false,
                        closeButton: false,
                        closeOnClick: false,
                        draggable: false,
                        position: "top-center",
                        style: { background: 'none', boxShadow: 'none', width: '100%', maxWidth: '650px' }
                      }
                    );
                  }}
                  className={`py-2 px-4 rounded-md ${darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiEye className="mr-2" /> Preview
                </button>
              </div>
            </div>

            {/* 1,000 Likes Certificate */}
            <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-secondary-700 border-secondary-600' : 'bg-white border-gray-200'} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center mb-4">
                <FiAward className="text-3xl mr-3 text-red-500" />
                <h3 className="text-xl font-semibold">1K Video Likes</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Achieve 1,000 likes on a single video to unlock this engagement certificate.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.info('You will receive this certificate when one of your videos reaches 1,000 likes!')}
                  className={`flex-1 py-2 px-4 rounded-md ${darkMode ? 'bg-primary-700 hover:bg-primary-800' : 'bg-primary-600 hover:bg-primary-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiAward className="mr-2" /> Generate
                </button>
                <button
                  onClick={() => {
                    toast(
                      <div className="relative p-4 bg-white rounded-lg shadow-xl" style={{ maxWidth: '600px' }}>
                        <div className="absolute top-2 right-2">
                          <button onClick={() => toast.dismiss()} className="text-gray-500 hover:text-gray-700">
                            ×
                          </button>
                        </div>
                        <div className="certificate-preview border-8 border-double border-red-600 p-8 bg-gradient-to-r from-red-50 to-red-100">
                          <div className="text-center">
                            <div className="text-3xl font-serif text-red-800 mb-4 font-bold">Certificate of Achievement</div>
                            <div className="text-xl mb-8 text-red-700">1,000 Likes Milestone</div>
                            <div className="mb-4 text-red-900">This is to certify that</div>
                            <div className="text-2xl font-bold mb-4 text-red-800">[Video Title]</div>
                            <div className="mb-8 text-red-900">has successfully achieved 1,000 likes on YouTube</div>
                            <div className="text-sm text-red-700 mb-4">Awarded on [Date]</div>
                            <div className="flex justify-center mb-4">
                              <FiAward className="text-5xl text-red-600" />
                            </div>
                            <div className="text-sm text-red-700">SEO Keywords Master - Certificate of Excellence</div>
                          </div>
                        </div>
                      </div>,
                      {
                        autoClose: false,
                        closeButton: false,
                        closeOnClick: false,
                        draggable: false,
                        position: "top-center",
                        style: { background: 'none', boxShadow: 'none', width: '100%', maxWidth: '650px' }
                      }
                    );
                  }}
                  className={`py-2 px-4 rounded-md ${darkMode ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiEye className="mr-2" /> Preview
                </button>
              </div>
            </div>

            {/* SEO Master Certificate */}
            <div className={`p-6 rounded-lg border-2 ${darkMode ? 'bg-secondary-700 border-secondary-600' : 'bg-white border-gray-200'} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-center mb-4">
                <FiAward className="text-3xl mr-3 text-purple-500" />
                <h3 className="text-xl font-semibold">SEO Master</h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Optimize 50 videos using our SEO tools to earn the SEO Master certificate.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.info('Keep optimizing your videos! You will receive this certificate after optimizing 50 videos.')}
                  className={`flex-1 py-2 px-4 rounded-md ${darkMode ? 'bg-primary-700 hover:bg-primary-800' : 'bg-primary-600 hover:bg-primary-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiAward className="mr-2" /> Generate
                </button>
                <button
                  onClick={() => {
                    toast(
                      <div className="relative p-4 bg-white rounded-lg shadow-xl" style={{ maxWidth: '600px' }}>
                        <div className="absolute top-2 right-2">
                          <button onClick={() => toast.dismiss()} className="text-gray-500 hover:text-gray-700">
                            ×
                          </button>
                        </div>
                        <div className="certificate-preview border-8 border-double border-purple-600 p-8 bg-gradient-to-r from-purple-50 to-purple-100">
                          <div className="text-center">
                            <div className="text-3xl font-serif text-purple-800 mb-4 font-bold">Certificate of Achievement</div>
                            <div className="text-xl mb-8 text-purple-700">SEO Master</div>
                            <div className="mb-4 text-purple-900">This is to certify that</div>
                            <div className="text-2xl font-bold mb-4 text-purple-800">[Channel Name]</div>
                            <div className="mb-8 text-purple-900">has successfully optimized 50 videos using SEO Keywords Master</div>
                            <div className="text-sm text-purple-700 mb-4">Awarded on [Date]</div>
                            <div className="flex justify-center mb-4">
                              <FiAward className="text-5xl text-purple-600" />
                            </div>
                            <div className="text-sm text-purple-700">SEO Keywords Master - Certificate of Excellence</div>
                          </div>
                        </div>
                      </div>,
                      {
                        autoClose: false,
                        closeButton: false,
                        closeOnClick: false,
                        draggable: false,
                        position: "top-center",
                        style: { background: 'none', boxShadow: 'none', width: '100%', maxWidth: '650px' }
                      }
                    );
                  }}
                  className={`py-2 px-4 rounded-md ${darkMode ? 'bg-purple-700 hover:bg-purple-800' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors duration-200 flex items-center justify-center`}
                >
                  <FiEye className="mr-2" /> Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Ideas Tab */}
      {activeTab === 'content' && (
        <div className={`card ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-6">AI Content Ideas</h2>
          
          <div className="mb-6">
            <label className="label">Topic or Keywords</label>
            <input
              type="text"
              value={contentIdea}
              onChange={(e) => setContentIdea(e.target.value)}
              placeholder="Enter a topic or keywords"
              className={`w-full p-2 rounded border ${darkMode ? 'bg-secondary-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>

          <button
            className={`bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors ${
              generatingIdea ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (!contentIdea.trim()) {
                toast.error('Please enter a topic or keywords');
                return;
              }
              setGeneratingIdea(true);
              // Simulate AI response with random ideas
              setTimeout(() => {
                const ideas = [
                  `"${contentIdea}" explained in 5 minutes`,
                  `Top 10 tips for ${contentIdea}`,
                  `How to master ${contentIdea} - Beginner's guide`,
                  `${contentIdea} trends in ${new Date().getFullYear()}`,
                  `Common mistakes to avoid in ${contentIdea}`
                ];
                toast.success(
                  <div>
                    <h3 className="font-bold mb-2">Content Ideas:</h3>
                    <ul className="list-disc pl-4">
                      {ideas.map((idea, index) => (
                        <li key={index} className="mb-1">{idea}</li>
                      ))}
                    </ul>
                  </div>,
                  { autoClose: 10000 }
                );
                setGeneratingIdea(false);
              }, 1500);
            }}
            disabled={generatingIdea}
          >
            {generatingIdea ? 'Generating Ideas...' : 'Generate Ideas'}
          </button>
        </div>
      )}

      {/* Processing Section - Only show when a video is being processed */}
      {processingVideo && (
        <div className={`card mt-8 ${darkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <h2 className="text-2xl font-bold mb-4">{t('processingVideo')}</h2>
          
          <div className="flex items-center mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ 
                  width: processingVideo.step === 'extracting' ? '33%' : 
                         processingVideo.step === 'generating' ? '66%' : '100%' 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
