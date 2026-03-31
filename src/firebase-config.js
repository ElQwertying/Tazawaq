// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyBI7lbFVejhxIaAOp2fiYKK0vVGVZJntEY",
	authDomain: "tazawaq.firebaseapp.com",
	projectId: "tazawaq",
	storageBucket: "tazawaq.firebasestorage.app",
	messagingSenderId: "120461778429",
	appId: "1:120461778429:web:321c3a039f25bef292cd94",
	measurementId: "G-5G9ND7LSZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { collection, getDocs };
const analytics = getAnalytics(app);