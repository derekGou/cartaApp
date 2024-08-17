// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "flashcards-a59d9.firebaseapp.com",
  projectId: "flashcards-a59d9",
  storageBucket: "flashcards-a59d9.appspot.com",
  messagingSenderId: "257692684195",
  appId: "1:257692684195:web:8b2fff160ec565600d1416"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db }