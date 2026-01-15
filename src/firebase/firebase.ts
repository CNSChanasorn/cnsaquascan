import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaEUABVsjBhPqrv-4m2zjhq7ov8GSOsZU",
  authDomain: "app-orange-cdaa1.firebaseapp.com",
  projectId: "app-orange-cdaa1",
  storageBucket: "app-orange-cdaa1.firebasestorage.app",
  messagingSenderId: "898632091613",
  appId: "1:898632091613:web:404825d79920be53a5d834",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);