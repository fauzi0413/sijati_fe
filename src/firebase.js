import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkHndNfmzK-2Z8gNzK3qXIufK2phi84Hg",
  authDomain: "sijaki-6d3c2.firebaseapp.com",
  projectId: "sijaki-6d3c2",
  storageBucket: "sijaki-6d3c2.firebasestorage.app",
  messagingSenderId: "84090003880",
  appId: "1:84090003880:web:35d775af3f26325ca5fd9d",
  measurementId: "G-CZ00CHJHSJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
