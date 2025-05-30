import React, { createContext, useContext, useState } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => {
  return useContext(TranslationContext);
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      dashboard: 'Dashboard',
      videoSeoDashboard: 'AI Video Boost Dashboard',
      dragAndDrop: 'Drag and drop a video file here, or click to browse',
      profile: 'Profile',
      login: 'Login',
      logout: 'Logout',
      signup: 'Sign Up',
      home: 'Home',
      title: 'AI VIDEO BOOST',
      // Dashboard translations
      upload: 'Upload',
      history: 'History',
      hosting: 'YouTube Hosting',
      uploadVideo: 'Upload Video',
      videoTitle: 'Video Title',
      chooseFile: 'Choose File',
      uploadNow: 'Upload Now',
      processingVideo: 'Processing Video',
      uploadingVideo: 'Uploading Video',
      videoHistory: 'Video History',
      noVideos: 'No videos uploaded yet',
      connectYoutube: 'Connect YouTube Account',
      uploadToYoutube: 'Upload to YouTube',
      processingComplete: 'Processing Complete',
      viewResults: 'View Results',
      dateUploaded: 'Date Uploaded',
      status: 'Status',
      actions: 'Actions',
      enterVideoTitle: 'Enter video title',
      supportedFormats: 'MP4, MOV, AVI, or WebM (max 50MB)',
      youtubeConnectDescription: 'Connect your YouTube account to upload videos with optimized SEO tags.',
      connecting: 'Connecting',
      youtubeRedirectMessage: 'You\'ll be redirected to Google to authorize access to your YouTube account.',
      // Certificate translations
      certificates: 'Certificates',
      achievementCertificate: 'Achievement Certificate',
      downloadCertificate: 'Download Certificate',
      shareCertificate: 'Share Certificate',
      certificateDescription: 'Celebrate your video optimization milestones',
      // Content Ideas translations
      contentIdeas: 'Content Ideas',
      generateIdeas: 'Generate Ideas',
      trendingTopics: 'Trending Topics',
      savedIdeas: 'Saved Ideas',
      ideaDescription: 'Get AI-powered content suggestions',
      topicKeywords: 'Topic or Keywords',
      enterTopicKeywords: 'Enter a topic or keywords',
      enterTopicFirst: 'Please enter a topic or keywords first',
      generating: 'Generating...',
      ideasGenerated: 'Content ideas generated successfully!',
      comingSoon: 'Coming soon...',
      noSavedIdeas: 'No saved ideas yet',
      // Tutorial translations
      tutorial: 'Tutorial',
      nextTip: 'Next Tip',
      skipTutorial: 'Skip Tutorial',
      gotIt: 'Got It!',
      welcomeTutorial: 'Welcome to AI Video Boost',
      uploadTutorial: 'Learn how to upload and optimize your videos',
      seoTutorial: 'Discover SEO optimization features',
      analyticsTutorial: 'Track your video performance'
    },
    te: {
      dashboard: 'డాష్‌బోర్డ్',
      videoSeoDashboard: 'AI వీడియో బూస्ट् డాష్‌బోర్డ్',
      dragAndDrop: 'వీడియో ఫైల్‌ను ఇక్కడ డ్రాగ్ చేసి డ్రాప్ చేయండి లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి',
      profile: 'ప్రొఫైల్',
      login: 'లాగిన్',
      logout: 'లాగ్అవుట్',
      signup: 'సైన్ అప్',
      home: 'హోమ్',
      title: 'ఎఐ వీడియో బూస్ట్',
      // Dashboard translations
      upload: 'అప్‌లోడ్',
      history: 'చరిత్ర',
      hosting: 'యూట్యూబ్ హోస్టింగ్',
      uploadVideo: 'వీడియో అప్‌లోడ్ చేయండి',
      videoTitle: 'వీడియో శీర్షిక',
      chooseFile: 'ఫైల్‌ను ఎంచుకోండి',
      uploadNow: 'ఇప్పుడు అప్‌లోడ్ చేయండి',
      processingVideo: 'వీడియో ప్రాసెసింగ్',
      uploadingVideo: 'వీడియో అప్‌లోడ్ అవుతోంది',
      videoHistory: 'వీడియో చరిత్ర',
      noVideos: 'ఇంకా వీడియోలు అప్‌లోడ్ చేయలేదు',
      connectYoutube: 'యూట్యూబ్ ఖాతాను కనెక్ట్ చేయండి',
      uploadToYoutube: 'యూట్యూబ్‌కు అప్‌లోడ్ చేయండి',
      processingComplete: 'ప్రాసెసింగ్ పూర్తయింది',
      viewResults: 'ఫలితాలను చూడండి',
      dateUploaded: 'అప్‌లోడ్ చేసిన తేదీ',
      status: 'స్థితి',
      actions: 'చర్యలు',
      enterVideoTitle: 'వీడియో శీర్షికను నమోదు చేయండి',
      supportedFormats: 'MP4, MOV, AVI, లేదా WebM (గరిష్టంగా 50MB)',
      youtubeConnectDescription: 'యూట్యూబ్ ఖాతాను కనెక్ట్ చేసి SEO ట్యాగ్‌లతో వీడియోలను అప్‌లోడ్ చేయండి',
      connecting: 'కనెక్ట్ అవుతోంది',
      youtubeRedirectMessage: 'మీరు యూట్యూబ్ ఖాతా కోసం ప్రామాణికరణ కోసం Googleకి మళ్లించబడతారు',
      // Certificate translations
      certificates: 'సర్టిఫికేట్లు',
      achievementCertificate: 'సాధన సర్టిఫికేట్',
      downloadCertificate: 'సర్టిఫికేట్ డౌన్‌లోడ్ చేయండి',
      shareCertificate: 'సర్టిఫికేట్ షేర్ చేయండి',
      certificateDescription: 'మీ వీడియో ఆప్టిమైజేషన్ మైలురాళ్లను జరుపుకోండి',
      // Content Ideas translations
      contentIdeas: 'కంటెంట్ ఐడియాలు',
      generateIdeas: 'ఐడియాలు జనరేట్ చేయండి',
      trendingTopics: 'ట్రెండింగ్ టాపిక్స్',
      savedIdeas: 'సేవ్ చేసిన ఐడియాలు',
      ideaDescription: 'AI ఆధారిత కంటెంట్ సూచనలు పొందండి',
      topicKeywords: 'టాపిక్ లేదా కీవర్డ్స్',
      enterTopicKeywords: 'టాపిక్ లేదా కీవర్డ్స్ నమోదు చేయండి',
      enterTopicFirst: 'దయచేసి ముందుగా టాపిక్ లేదా కీవర్డ్స్ నమోదు చేయండి',
      generating: 'జనరేట్ అవుతోంది...',
      ideasGenerated: 'కంటెంట్ ఐడియాలు విజయవంతంగా జనరేట్ చేయబడ్డాయి!',
      comingSoon: 'త్వరలో వస్తుంది...',
      noSavedIdeas: 'ఇంకా సేవ్ చేసిన ఐడియాలు లేవు',
      // Tutorial translations
      tutorial: 'ట్యుటోరియల్',
      nextTip: 'తదుపరి టిప్',
      skipTutorial: 'ట్యుటోరియల్ స్కిప్ చేయండి',
      gotIt: 'అర్థమైంది!',
      welcomeTutorial: 'AI వీడియో బూస్ట్‌కి స్వాగతం',
      uploadTutorial: 'మీ వీడియోలను ఎలా అప్‌లోడ్ చేయాలో మరియు ఆప్టిమైజ్ చేయాలో తెలుసుకోండి',
      seoTutorial: 'SEO ఆప్టిమైజేషన్ ఫీచర్లను కనుగొనండి',
      analyticsTutorial: 'మీ వీడియో పనితీరును ట్రాక్ చేయండి'
    },
    hi: {
      dashboard: 'डैशबोर्ड',
      videoSeoDashboard: 'AI वीडियो बूस्ट डैशबोर्ड',
      dragAndDrop: 'वीडियो फ़ाइल को यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
      profile: 'प्रोफाइल',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      signup: 'साइन अप',
      home: 'होम',
      title: 'एआई वीडियो बूस्ट',
      // Dashboard translations
      upload: 'अपलोड',
      history: 'इतिहास',
      hosting: 'यूट्यूब होस्टिंग',
      uploadVideo: 'वीडियो अपलोड करें',
      videoTitle: 'वीडियो का शीर्षक',
      chooseFile: 'फाइल चुनें',
      uploadNow: 'अभी अपलोड करें',
      processingVideo: 'वीडियो प्रोसेसिंग',
      uploadingVideo: 'वीडियो अपलोड हो रहा है',
      videoHistory: 'वीडियो इतिहास',
      noVideos: 'अभी तक कोई वीडियो अपलोड नहीं किया गया',
      connectYoutube: 'यूट्यूब अकाउंट कनेक्ट करें',
      uploadToYoutube: 'यूट्यूब पर अपलोड करें',
      processingComplete: 'प्रोसेसिंग पूर्ण',
      viewResults: 'परिणाम देखें',
      dateUploaded: 'अपलोड की तारीख',
      status: 'स्थिति',
      actions: 'कार्रवाई',
      enterVideoTitle: 'वीडियो का शीर्षक दर्ज करें',
      supportedFormats: 'MP4, MOV, AVI, या WebM (अधिकतम 50MB)',
      youtubeConnectDescription: 'यूट्यूब खाता कनेक्ट करें और SEO टैग के साथ वीडियो अपलोड करें',
      connecting: 'कनेक्ट हो रहा है',
      youtubeRedirectMessage: 'आपको यूट्यूब खाते के लिए प्रमाणीकरण हेतु Google पर रीडायरेक्ट किया जाएगा',
      // Certificate translations
      certificates: 'प्रमाणपत्र',
      achievementCertificate: 'उपलब्धि प्रमाणपत्र',
      downloadCertificate: 'प्रमाणपत्र डाउनलोड करें',
      shareCertificate: 'प्रमाणपत्र साझा करें',
      certificateDescription: 'अपने वीडियो ऑप्टिमाइज़ेशन मील के पत्थर का जश्न मनाएं',
      // Content Ideas translations
      contentIdeas: 'कंटेंट आइडिया',
      generateIdeas: 'आइडिया जनरेट करें',
      trendingTopics: 'ट्रेंडिंग टॉपिक्स',
      savedIdeas: 'सेव किए गए आइडिया',
      ideaDescription: 'AI-पावर्ड कंटेंट सुझाव प्राप्त करें',
      topicKeywords: 'टॉपिक या कीवर्ड्स',
      enterTopicKeywords: 'टॉपिक या कीवर्ड्स दर्ज करें',
      enterTopicFirst: 'कृपया पहले टॉपिक या कीवर्ड्स दर्ज करें',
      generating: 'जनरेट हो रहा है...',
      ideasGenerated: 'कंटेंट आइडिया सफलतापूर्वक जनरेट किए गए!',
      comingSoon: 'जल्द आ रहा है...',
      noSavedIdeas: 'अभी तक कोई सेव किया गया आइडिया नहीं है',
      // Tutorial translations
      tutorial: 'ट्यूटोरियल',
      nextTip: 'अगला टिप',
      skipTutorial: 'ट्यूटोरियल छोड़ें',
      gotIt: 'समझ गया!',
      welcomeTutorial: 'AI वीडियो बूस्ट में आपका स्वागत है',
      uploadTutorial: 'जानें कैसे अपने वीडियो अपलोड और ऑप्टिमाइज़ करें',
      seoTutorial: 'SEO ऑप्टिमाइज़ेशन फीचर्स को खोजें',
      analyticsTutorial: 'अपने वीडियो का प्रदर्शन ट्रैक करें'
    }
  };

  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
