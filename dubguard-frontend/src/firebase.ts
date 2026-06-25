import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeAlvcgs3rb4HtG7AWuOUnweWAFmR5MeM",
  authDomain: "dubgaurd-auth.firebaseapp.com",
  projectId: "dubgaurd-auth",
  storageBucket: "dubgaurd-auth.firebasestorage.app",
  messagingSenderId: "824910935888",
  appId: "1:824910935888:web:a56dc76fdc24900c599e55",
  measurementId: "G-3KJFJ4CVMF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
