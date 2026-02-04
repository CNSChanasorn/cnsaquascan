import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCuBQOodnzBXXsYZk47qNo5RJ5_Np4ksI",
  authDomain: "cnsaquascan.firebaseapp.com",
  projectId: "cnsaquascan",
  storageBucket: "cnsaquascan.firebasestorage.app",
  messagingSenderId: "242111393690",
  appId: "1:242111393690:web:c0623f8734d55dbc0d5423",
  measurementId: "G-RLNEVPNSHK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
