import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBNJqtaWOJjxim1VFy0JQR1RB58mIFZBIE",
    authDomain: "chat-devoir.firebaseapp.com",
    projectId: "chat-devoir",
    storageBucket: "chat-devoir.firebasestorage.app",
    messagingSenderId: "674067734632",
    appId: "1:674067734632:web:57938066d55bab66bc5bdd",
    measurementId: "G-ZZMFF3MYKG"
  };
  
// Initialiser Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Exporter les instances de Firebase
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db };