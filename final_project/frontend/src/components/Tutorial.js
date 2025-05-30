import React from 'react';
import Joyride from 'react-joyride';
import { useTutorial } from '../context/TutorialContext';

const Tutorial = () => {
  const { isTutorialMode, toggleTutorialMode } = useTutorial();

  if (!isTutorialMode) return null;

  return (
    <Joyride
      steps={[
        {
          target: '#keyword-section',
          content: 'Here you can analyze and optimize your video keywords to improve visibility.',
          placement: 'center',
          disableBeacon: true,
          spotlightPadding: 0
        },
        {
          target: '#analytics-section',
          content: 'Track your video performance metrics and understand your audience.',
          placement: 'center',
          spotlightPadding: 0
        },
        {
          target: '#notification-section',
          content: 'Stay updated with real-time alerts about your video performance.',
          placement: 'center',
          spotlightPadding: 0
        }
      ]}
      run={isTutorialMode}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      hideCloseButton={true}
      disableOverlayClose={true}
      spotlightClicks={false}
      callback={({ status }) => {
        if (['finished', 'skipped'].includes(status)) {
          toggleTutorialMode();
        }
      }}
      floaterProps={{
        disableAnimation: true
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: '#3B82F6',
          overlayColor: 'transparent',
          backgroundColor: '#ffffff',
        },
        tooltip: {
          backgroundColor: '#ffffff',
          textColor: '#1F2937',
          borderRadius: '8px',
          fontSize: '14px',
          padding: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        },
        buttonNext: {
          backgroundColor: '#3B82F6',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 500
        },
        buttonBack: {
          color: '#3B82F6',
          marginRight: '8px',
          fontWeight: 500
        },
        buttonSkip: {
          color: '#6B7280',
          fontWeight: 500
        },
        spotlight: {
          backgroundColor: 'transparent'
        }
      }}
    />
  );
};

export default Tutorial;
