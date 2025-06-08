import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logAnalyticsEvent } from './analytics'; // Import the helper

const useScreenTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const screenPath = location.pathname;
    let screenName = screenPath.substring(1) || 'home'; // Default to 'home' if path is '/'

    // Handle cases where screen names might need more specific naming from paths like /results or /settings
    if (screenPath === '/results') {
        screenName = 'exam_results';
    } else if (screenPath === '/settings') {
        screenName = 'settings';
    }
    // Add more specific screen name mappings if needed

    logAnalyticsEvent('screen_view', {
      firebase_screen: screenName, // Firebase standard parameter for screen name
      firebase_screen_class: screenName.charAt(0).toUpperCase() + screenName.slice(1) + "Page", // Firebase standard for screen class
      page_path: screenPath,
      page_title: document.title // Capture page title as well
    });
  }, [location]);
};

export default useScreenTracking;
