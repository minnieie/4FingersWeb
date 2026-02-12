/**
 * Firebase Authentication Module
 * Handles user authentication, profile management, and profile picture uploads/storage
 * Integrates with Firebase Authentication, Realtime Database, and Cloud Storage
 */

// Import Firebase configuration
import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

// Import Firebase Auth functions for user authentication
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Import Firebase Database functions for user data storage
import { 
    getDatabase, 
    ref, 
    set 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// Import Firebase Storage functions for profile picture management
import { 
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

// ============================================
// Firebase Initialization
// ============================================

// Initialize Firebase app with configuration
const app = initializeApp(firebaseConfig);

// Get references to Firebase services
const auth = getAuth(app); // Authentication service
const db = getDatabase(app); // Realtime Database service
const storage = getStorage(app); // Cloud Storage service

// ============================================
// Helper Functions
// ============================================

/**
 * Translates Firebase error codes into user-friendly error messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} Human-readable error message
 */
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

/**
 * Creates the initial achievements structure for new users
 * Matches the structure used in Unity version (DatabaseManager.cs)
 * @returns {Object} Object containing all available achievements with unlocked status
 */
const createInitialAchievements = () => {
    return {
        firstDrill: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        perfectDrill: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        regolithMaster: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        basaltMaster: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        gypsumMaster: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        clayMaster: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        carbonateMaster: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        waterMaster: {
            unlocked: false,
            unlockDate: "",
            score: 0
        },
        allRocksMastered: {
            unlocked: false,
            unlockDate: "",
            score: 0
        }
    };
};

/**
 * Creates a new user profile in the Realtime Database
 * Initializes user data with profile info, inventory, tools, samples, scores, and achievements
 * Matches the exact structure used in Unity version (DatabaseManager.cs)
 * @param {string} userId - The Firebase user ID
 * @param {string} email - The user's email address
 * @returns {Promise<Object>} Success status and message
 */
const createUserProfile = async (userId, email) => {
    try {
        const userRef = ref(db, `users/${userId}`);
        
        // EXACT same structure as Unity DatabaseManager.cs
        const userData = {
            profile: {
                email: email,
                accountCreated: new Date().toISOString(), // Same as DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
                lastLogin: new Date().toISOString()
            },
            inventory: {
                tools: ["repairTool", "wiperTool", "extractor"], // Unity uses list, not dictionary
                samples: {
                    water: {
                        amount: 0,
                        highScore: 0
                    },
                    regolith: {
                        amount: 0,
                        highScore: 0
                    },
                    smeciteClay: {
                        amount: 0,
                        highScore: 0
                    },
                    gypsum: {
                        amount: 0,
                        highScore: 0
                    },
                    carbonateRock: {
                        amount: 0,
                        highScore: 0
                    },
                    basalt: {
                        amount: 0,
                        highScore: 0
                    }
                }
            },
            scores: {
                totalScore: 0
            },
            achievements: createInitialAchievements() // Add achievements section
        };
        
        await set(userRef, userData);
        return { success: true };
    } catch (error) {
        console.error("Error creating user profile:", error);
        return { success: false, message: "Failed to create user profile." };
    }
};

// ============================================
// Authentication Functions
// ============================================

/**
 * Authenticates a user with email and password
 * Updates the user's last login timestamp in the database
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Success status, user object, and error message if failed
 */
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

/**
 * Creates a new user account and initializes their profile
 * Validates password length, creates auth account, and sets up database profile
 * @param {string} email - User's email address
 * @param {string} password - User's password (must be at least 6 characters)
 * @returns {Promise<Object>} Success status, user object, and error message if failed
 */
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
/**
 * Signs out the currently authenticated user
 * @returns {Promise<void>}
 */
export const logoutUser = () => signOut(auth);

/**
 * Watches for changes in authentication state
 * Calls the provided callback function whenever the user's authentication status changes
 * @param {Function} callback - Function to call with the user object or null
 * @returns {Function} Unsubscribe function
 */
export const watchAuthState = (callback) => onAuthStateChanged(auth, callback);

// ============================================
// Profile Picture Functions
// ============================================

/**
 * Uploads a profile picture to Firebase Storage and saves the URL to the user's profile
 * Validates file type (image only) and size (max 5MB)
 * @param {string} userId - The user's Firebase UID
 * @param {File} file - The image file to upload
 * @param {string} userDisplayName - Optional user display name for filename
 * @returns {Promise<Object>} Success status, download URL, and message
 */
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

/**
 * Deletes the user's profile picture from Firebase Storage and database
 * Removes both the file from storage and the URL reference from the user's profile
 * @param {string} userId - The user's Firebase UID
 * @param {string} currentPhotoURL - Optional URL of the current profile picture
 * @returns {Promise<Object>} Success status and message
 */
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

/**
 * Retrieves the user's profile picture URL from the database
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<string|null>} The download URL of the profile picture or null if not found
 */
export const getProfilePictureURL = async (userId) => {
    try {
        const userRef = ref(db, `users/${userId}/profile/photoURL`);
        // Fetch the URL from the database
        const snapshot = await get(userRef);
        return snapshot.val(); // Return the URL value or null if not found
    } catch (error) {
        console.error("Error getting profile picture URL:", error);
        return null;
    }
};

// ============================================
// Firebase Service Exports
// ============================================

// Export Firebase service instances for use in other modules
export { auth, db, storage };