import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";

// Use Vite environment variables for Firebase config
const firebaseConfig = {
  apiKey: "__FB_API_KEY__",
  authDomain: "__FB_AUTH_DOMAIN__",
  projectId: "__FB_PROJECT_ID__",
  storageBucket: "__FB_STORAGE_BUCKET__",
  messagingSenderId: "__FB_MESSAGING_SENDER_ID__",
  appId: "__FB_APP_ID__",
  measurementId: "__FB_MEASUREMENT_ID__",
};

const app = initializeApp(firebaseConfig);

let analytics: ReturnType<typeof getAnalytics> | null = null;
(async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    analytics = getAnalytics(app);
  }
})();

export { analytics };

export function logFirebaseEvent(eventName: string, params?: Record<string, any>) {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}
