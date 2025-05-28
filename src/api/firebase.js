import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration - NO process.env at all
const firebaseConfig = {
  apiKey: "AIzaSyA3rIyxVfdUFHrGvp3u6vFZAMjRUzEq4x0",
  authDomain: "it-help-desk-e727c.firebaseapp.com",
  projectId: "it-help-desk-e727c",
  storageBucket: "it-help-desk-e727c.firebasestorage.app",
  messagingSenderId: "850408124848",
  appId: "1:850408124848:web:d8b86922aec1796ab46675",
  measurementId: "G-NQLDTZ26V3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Debug log
console.log('🔥 Firebase initialized successfully');
console.log('📊 Database instance:', db);

export default app;
