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

// Helper function to translate technical errors into human-friendly ones
const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return "That doesn't look like a valid email address.";
        case 'auth/user-not-found':
            return "We couldn't find an account with that email.";
        case 'auth/wrong-password':
            return "The password you entered is incorrect.";
        case 'auth/email-already-in-use':
            return "An account already exists with this email.";
        case 'auth/weak-password':
            return "Your password is too weak. Try using at least 6 characters.";
        case 'auth/too-many-requests':
            return "Too many failed attempts. Please try again later.";
        default:
            return "Something went wrong. Please try again.";
    }
};

// Updated Logic Wrappers
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, message: getFriendlyErrorMessage(error.code) };
    }
};

export const signupUser = async (email, password) => {
    // Client-side validation for password length
    if (password.length < 6) {
        return { success: false, message: "Your password must be at least 6 characters long." };
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, message: getFriendlyErrorMessage(error.code) };
    }
};

export const logoutUser = () => signOut(auth);
export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);

export { auth };