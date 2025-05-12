import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNc1gbStuw-3T8M5EmWE_dzSwfqr6A3cA",
  authDomain: "agritech-2120a.firebaseapp.com",
  projectId: "agritech-2120a",
  storageBucket: "agritech-2120a.firebasestorage.app",
  messagingSenderId: "591226450858",
  appId: "1:591226450858:web:918f2590893b9cf82f31d3"
};

// Initialize Firebase only if not already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

// Import the functions you need from the SDKs you need
