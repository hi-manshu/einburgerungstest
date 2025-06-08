import { analytics } from '../firebase'; // Adjust path as necessary
import { logEvent as firebaseLogEvent, AnalyticsCallOptions } from 'firebase/analytics';

/**
 * Logs an event to Firebase Analytics.
 * @param eventName The name of the event.
 * @param eventParams Optional parameters for the event.
 * @param options Optional options for the event.
 */
export const logAnalyticsEvent = (
  eventName: string,
  eventParams?: { [key: string]: any },
  options?: AnalyticsCallOptions
) => {
  firebaseLogEvent(analytics, eventName, eventParams, options);
};
