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
// ADD THESE STORAGE IMPORTS
import { 
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
// Initialize Storage
const storage = getStorage(app);

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

// Upload profile picture to Firebase Storage
export const uploadProfilePicture = async (userId, file, userDisplayName = null) => {
    try {
        // Validate file
        if (!file.type.match('image.*')) {
            return { success: false, message: "Please select an image file (JPG, PNG, GIF)" };
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            return { success: false, message: "Image size should be less than 5MB" };
        }
        
        // Create filename with user's display name or email
        let userName = userDisplayName || `user_${userId.substring(0, 8)}`; // Fallback to partial UID
        // Clean the name for filename use
        userName = userName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_') // Replace non-alphanumeric with underscore
            .substring(0, 20); // Limit length
        
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${userName}_${timestamp}.${fileExtension}`;
        const storagePath = `profile-pictures/${userId}/${fileName}`;
        
        // Create storage reference
        const imageRef = storageRef(storage, storagePath);
        
        // Upload file
        await uploadBytes(imageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(imageRef);
        
        // Save URL to user's database profile
        const userRef = ref(db, `users/${userId}/profile/photoURL`);
        await set(userRef, downloadURL);
        
        return { 
            success: true, 
            url: downloadURL,
            message: "Profile picture uploaded successfully!" 
        };
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        return { 
            success: false, 
            message: error.code === 'storage/unauthorized' 
                ? "You don't have permission to upload images." 
                : "Failed to upload image. Please try again." 
        };
    }
};

// Delete profile picture from Firebase Storage
export const deleteProfilePicture = async (userId, currentPhotoURL = null) => {
    try {
        // If we have a current photo URL, try to delete it from storage
        if (currentPhotoURL) {
            try {
                // Extract the path from the URL
                const urlPath = currentPhotoURL.split('/o/')[1]?.split('?')[0];
                if (urlPath) {
                    const decodedPath = decodeURIComponent(urlPath);
                    const oldImageRef = storageRef(storage, decodedPath);
                    await deleteObject(oldImageRef);
                }
            } catch (storageError) {
                console.warn("Could not delete old image from storage:", storageError);
                // Continue anyway - we'll still remove the database reference
            }
        }
        
        // Remove URL from user's database profile
        const userRef = ref(db, `users/${userId}/profile/photoURL`);
        await set(userRef, null);
        
        return { 
            success: true, 
            message: "Profile picture removed successfully!" 
        };
    } catch (error) {
        console.error("Error deleting profile picture:", error);
        return { 
            success: false, 
            message: "Failed to remove profile picture. Please try again." 
        };
    }
};

// Get user's profile picture URL
export const getProfilePictureURL = async (userId) => {
    try {
        const userRef = ref(db, `users/${userId}/profile/photoURL`);
        // Note: You would need to use onValue or get to retrieve this
        // This is a helper function that would be used with other Firebase methods
        return null; // Placeholder - actual implementation depends on your data fetching
    } catch (error) {
        console.error("Error getting profile picture URL:", error);
        return null;
    }
};

// Export storage instance
export { auth, db, storage };