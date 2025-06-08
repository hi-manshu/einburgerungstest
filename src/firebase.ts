import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA2iu4CSqwPT9TavzDwC_FTD_VG9VwS3QE",
  authDomain: "einburgerungstest-practice.firebaseapp.com",
  projectId: "einburgerungstest-practice",
  storageBucket: "einburgerungstest-practice.firebasestorage.app",
  messagingSenderId: "712588575914",
  appId: "1:712588575914:web:74fa640169b854926cfcd3",
  measurementId: "G-QCFE1EGNY3",
};

const app = initializeApp(firebaseConfig);
const analytics: Analytics = getAnalytics(app);

export { app, analytics };
