// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber}  from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
  import { getFirestore, collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCmZ9QrVgy5Gi3-gDY_s2VwrQBjyXivpVM",
    authDomain: "skillsexchange-95876.firebaseapp.com",
    projectId: "skillsexchange-95876",
    storageBucket: "skillsexchange-95876.firebasestorage.app",
    messagingSenderId: "423068106255",
    appId: "1:423068106255:web:9500b49bfd776aed83ed7a",
    measurementId: "G-TTHFGKKFCY"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const db = getFirestore(app);

  export { auth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut,  sendPasswordResetEmail, onAuthStateChanged, provider, signInWithPopup, RecaptchaVerifier};
  export { db, collection, addDoc,  doc, deleteDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp};
