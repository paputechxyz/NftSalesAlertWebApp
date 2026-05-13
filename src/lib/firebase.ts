import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFwrbEe042psqbBZTi9ZPqnL7tsX6ZCkQ",
  authDomain: "nft-sales-38208.firebaseapp.com",
  projectId: "nft-sales-38208",
  storageBucket: "nft-sales-38208.firebasestorage.app",
  messagingSenderId: "1081812286827",
  appId: "1:1081812286827:web:9f25fb38ae7b1032e8602e",
  measurementId: "G-PVL8NYK2J7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
