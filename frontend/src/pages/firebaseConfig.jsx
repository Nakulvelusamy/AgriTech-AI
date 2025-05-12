import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyD2X6r3frb8TUIGrAtTOsFlHhyxdmOhhDE",
    authDomain: "authentication-d7b1a.firebaseapp.com",
    projectId: "authentication-d7b1a",
    storageBucket: "authentication-d7b1a.firebasestorage.app",
    messagingSenderId: "473842792787",
    appId: "1:473842792787:web:c345dd9b2294a4b41b89a6"
  };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs };
