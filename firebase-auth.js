import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
    getDatabase, 
    ref, 
    set 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

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

// Function to create user profile in database - EXACT Unity structure
const createUserProfile = async (userId, email) => {
    try {
        const userRef = ref(db, `users/${userId}`);
        
        // EXACT same structure as Unity DatabaseManager.cs
        const userData = {
            profile: {
                email: email,
                accountCreated: new Date().toISOString(), // Same as DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
                lastLogin: new Date().toISOString()
                // Note: No username field in Unity version
            },
            inventory: {
                tools: {
                    Repair_tool: false,
                    Wiper_tool: false,
                    Extractor: false
                },
                samples: {
                    Water: 0,
                    Regolith: 0,
                    Smecite_Clay: 0, // Note: Typo from your Unity file - "Smecite" not "Smectite"
                    Gypsum: 0,
                    Carbonate_Rock: 0,
                    Basalt: 0
                }
            }
            // Note: No "stats" object in your Unity version
        };
        
        await set(userRef, userData);
        return { success: true };
    } catch (error) {
        console.error("Error creating user profile:", error);
        return { success: false, message: "Failed to create user profile." };
    }
};

// Updated Logic Wrappers
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update last login time - EXACT same as Unity
        const userRef = ref(db, `users/${userCredential.user.uid}/profile/lastLogin`);
        await set(userRef, new Date().toISOString());
        
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
        // 1. Create authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;
        
        // 2. Create user profile in database - EXACT Unity structure
        const dbResult = await createUserProfile(userId, email);
        
        if (!dbResult.success) {
            return { 
                success: false, 
                message: dbResult.message || "Account created but profile setup failed." 
            };
        }
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, message: getFriendlyErrorMessage(error.code) };
    }
};

export const logoutUser = () => signOut(auth);
export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);

export { auth, db };