import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logAnalyticsEvent } from './analytics';

const useScreenTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const screenPath = location.pathname;
    let screenName = screenPath.substring(1) || 'home';


    if (screenPath === '/results') {
        screenName = 'exam_results';
    } else if (screenPath === '/settings') {
        screenName = 'settings';
    }


    logAnalyticsEvent('screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenName.charAt(0).toUpperCase() + screenName.slice(1) + "Page",
      page_path: screenPath,
      page_title: document.title
    });
  }, [location]);
};

export default useScreenTracking;
