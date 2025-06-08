import { analytics } from "../firebase";
import {
  logEvent as firebaseLogEvent,
  AnalyticsCallOptions,
} from "firebase/analytics";

export const logAnalyticsEvent = (
  eventName: string,
  eventParams?: { [key: string]: any },
  options?: AnalyticsCallOptions,
) => {
  firebaseLogEvent(analytics, eventName, eventParams, options);
};
