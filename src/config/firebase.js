// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCtPsj6WPc1jX0m6ISajRjIl5BhXUFgOdw",
    authDomain: "tabadul-plus.firebaseapp.com",
    projectId: "tabadul-plus",
    storageBucket: "tabadul-plus.firebasestorage.app",
    messagingSenderId: "1067730460789",
    appId: "1:1067730460789:web:0080c93b5cbcda5b5e583c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app)