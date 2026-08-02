import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCPFnk7Gacyiq_8f_6u6cfcbx3Unv8QZJA",
  authDomain: "travel-app-e43a7.firebaseapp.com",
  projectId: "travel-app-e43a7",
  storageBucket: "travel-app-e43a7.firebasestorage.app",
  messagingSenderId: "947211345000",
  appId: "1:947211345000:web:6333a458552fb2cbd42fdd",
  measurementId: "G-03YJMDEQRG",
  databaseURL: "https://travel-app-e43a7-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
