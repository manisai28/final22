import React, { createContext, useState, useContext, useEffect } from 'react';

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Tutorial steps configuration
  const tutorialSteps = [
    {
      target: '.keyword-section',
      content: 'Welcome to your Video SEO Dashboard! Here you can optimize your videos for better reach.',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.analytics-section',
      content: 'Monitor your video performance with detailed analytics.',
      placement: 'bottom',
    },
    {
      target: '.notification-section',
      content: 'Get real-time notifications about your video performance.',
      placement: 'bottom',
    }
  ];

  const toggleTutorialMode = () => {
    console.log('Toggling tutorial mode');
    setIsTutorialMode(prev => !prev);
    setCurrentStep(0);
  };

  const nextStep = () => {
    console.log('Moving to next step');
    setCurrentStep(prev => prev + 1);
  };

  const resetTutorial = () => {
    console.log('Resetting tutorial');
    setCurrentStep(0);
  };

  return (
    <TutorialContext.Provider
      value={{
        isTutorialMode,
        toggleTutorialMode,
        currentStep,
        nextStep,
        resetTutorial,
        tutorialSteps,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => useContext(TutorialContext);
