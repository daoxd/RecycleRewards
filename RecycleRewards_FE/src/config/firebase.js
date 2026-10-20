import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD7JDfLWfR7v_R2iW6sqmlkVKjmFTMwETc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'recycle-rewards-2026.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'recycle-rewards-2026',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'recycle-rewards-2026.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '969481635714',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:969481635714:web:7cef1596928bbe586f319b',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
