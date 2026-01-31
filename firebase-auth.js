import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Logic Wrappers
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signupUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);

export { auth };