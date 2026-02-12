/**
 * Profile Picture Module
 * Handles user profile picture management including:
 * - Loading and displaying profile pictures from Firebase Storage
 * - Uploading pictures from file or camera
 * - Removing profile pictures
 * - Camera capture with live preview
 */

// Import Firebase authentication and storage functions
import { auth, uploadProfilePicture, deleteProfilePicture, db } from './firebase-auth.js';
import { ref, get, set } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// ============================================
// Global Variables
// ============================================

// Current authenticated user
let currentUser = null;

// Current profile picture URL from Firebase Storage
let currentPhotoURL = null;

// MediaStream object for direct webcam access
let cameraStream = null;

// Flag to prevent duplicate event listener initialization
let listenersInitialized = false;

// ============================================
// Initialization
// ============================================

// Initialize profile picture functionality when page loads
// Sets up user authentication state listener
document.addEventListener('DOMContentLoaded', () => {
    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        // Exit if no user is logged in
        if (!user) return;

        // Set current user and load their profile picture
        currentUser = user;
        loadProfilePicture(user.uid);

        // Setup event listeners only once to prevent duplicates
        if (!listenersInitialized) {
            setupEventListeners();
            listenersInitialized = true;
        }
    });
});

/**
 * Loads the user's existing profile picture from Firebase Database
 * Displays the picture if it exists, otherwise shows default profile icon
 * @param {string} userId - The user's Firebase UID
 */
async function loadProfilePicture(userId) {
    try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            currentPhotoURL = data.profile?.photoURL;
            
            if (currentPhotoURL) {
                displayProfilePicture(currentPhotoURL);
            } else {
                displayDefaultProfile();
            }
        } else {
            displayDefaultProfile();
        }
    } catch (error) {
        console.error("Error loading profile picture:", error);
        displayDefaultProfile();
    }
}

/**
 * Displays a profile picture in the UI
 * Hides the default profile icon and shows the uploaded image
 * @param {string} url - Firebase Storage download URL of the profile picture
 */
function displayProfilePicture(url) {
    const profileImg = document.getElementById('profile-picture-img');
    const defaultProfile = document.getElementById('default-profile');
    
    if (profileImg && defaultProfile) {
        profileImg.src = url;
        profileImg.style.display = 'block';
        defaultProfile.style.display = 'none';
        currentPhotoURL = url;
    }
}

/**
 * Displays the default profile icon
 * Hides any uploaded profile picture
 */
function displayDefaultProfile() {
    const profileImg = document.getElementById('profile-picture-img');
    const defaultProfile = document.getElementById('default-profile');
    
    if (profileImg && defaultProfile) {
        profileImg.style.display = 'none';
        defaultProfile.style.display = 'flex';
        currentPhotoURL = null;
    }
}

// ============================================
// Event Listener Setup
// ============================================

/**
 * Sets up all event listeners for profile picture management
 * Handles file uploads, camera capture, and picture removal
 */
function setupEventListeners() {
    // Upload from file input - ONLY USE ONE FILE INPUT
    const fileInput = document.getElementById('profile-picture-input');
    const removeBtn = document.getElementById('remove-picture-btn');
    const takePhotoBtn = document.getElementById('take-photo-btn');
    const uploadFileLabel = document.getElementById('upload-file-label');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => handleFileSelect(e, 'file-input'));
    }
    
    if (removeBtn) {
        removeBtn.addEventListener('click', handleRemovePhoto);
    }
    
    if (takePhotoBtn) {
        takePhotoBtn.addEventListener('click', openCameraWithMediaDevices);
    }
    
    if (uploadFileLabel) {
        // When "Upload File" button is clicked, trigger the main file input
        uploadFileLabel.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    // Also trigger file input when clicking the main upload label
    const uploadLabel = document.getElementById('upload-label');
    if (uploadLabel) {
        uploadLabel.addEventListener('click', () => {
            fileInput.click();
        });
    }
}

// ============================================
// File Upload Handling
// ============================================

/**
 * Handles file selection from the file input
 * Validates file type and size, shows preview, and uploads to Firebase
 * @param {Event} event - File input change event
 * @param {string} source - Source of the file (file-input, camera-fallback, etc.)
 */
async function handleFileSelect(event, source) {
    const file = event.target.files[0];
    
    // No file selected
    if (!file) return;
    
    // Validate file
    if (!file.type.match('image.*')) {
        showMessage('Please select an image file (JPG, PNG, GIF)', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showMessage('Image size should be less than 5MB', 'error');
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const profileImg = document.getElementById('profile-picture-img');
        if (profileImg) {
            profileImg.src = e.target.result;
            profileImg.style.display = 'block';
            const defaultProfile = document.getElementById('default-profile');
            if (defaultProfile) defaultProfile.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
    
    // Show loading state
    showProgress(true);
    
    try {
        // Upload to Firebase Storage
        const result = await uploadProfilePicture(currentUser.uid, file);
        
        if (result.success) {
            // Update the displayed image with the Firebase URL
            displayProfilePicture(result.url);
            showMessage(result.message || 'Profile picture updated!', 'success');
        } else {
            // Revert to previous image
            if (currentPhotoURL) {
                displayProfilePicture(currentPhotoURL);
            } else {
                displayDefaultProfile();
            }
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error("Upload error:", error);
        // Revert to previous image
        if (currentPhotoURL) {
            displayProfilePicture(currentPhotoURL);
        } else {
            displayDefaultProfile();
        }
        showMessage("Failed to upload image. Please try again.", 'error');
    } finally {
        showProgress(false);
        // Clear the file input so the same file can be selected again
        event.target.value = '';
    }
}

/**
 * Handles removal of the user's profile picture
 * Requires confirmation before deletion
 * Removes the picture from Firebase Storage and displays default icon
 */
async function handleRemovePhoto() {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
        return;
    }
    
    try {
        const result = await deleteProfilePicture(currentUser.uid, currentPhotoURL);
        
        if (result.success) {
            displayDefaultProfile();
            showMessage(result.message || 'Profile picture removed!', 'success');
        } else {
            showMessage(result.message, 'error');
        }
    } catch (error) {
        console.error("Remove error:", error);
        showMessage("Failed to remove profile picture. Please try again.", 'error');
    }
}

// ============================================
// Camera Capture Functionality
// ============================================

/**
 * Opens the camera using MediaDevices API
 * Creates a modal with live camera feed and capture button
 * Falls back to file input if camera access is denied
 */
async function openCameraWithMediaDevices() {
    // Stop any existing camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Create camera modal
    const cameraModal = createCameraModal();
    document.body.appendChild(cameraModal);
    
    try {
        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false 
        });
        
        // Display camera feed
        const videoElement = cameraModal.querySelector('#camera-feed');
        videoElement.srcObject = cameraStream;
        
        // Wait for video to be ready
        videoElement.onloadedmetadata = () => {
            videoElement.play().catch(e => console.log("Video play error:", e));
        };
        
        // Setup event listeners for modal
        const captureBtn = cameraModal.querySelector('#capture-btn');
        const cancelBtn = cameraModal.querySelector('#cancel-camera');
        const retakeBtn = cameraModal.querySelector('#retake-btn');
        const usePhotoBtn = cameraModal.querySelector('#use-photo-btn');
        
        captureBtn.addEventListener('click', () => capturePhoto(videoElement, cameraModal));
        cancelBtn.addEventListener('click', () => closeCameraModal(cameraModal));
        
        // Initially hide retake and use photo buttons
        retakeBtn.style.display = 'none';
        usePhotoBtn.style.display = 'none';
        
    } catch (error) {
        console.error("Camera error:", error);
        closeCameraModal(cameraModal);
        
        // Fallback to file input with camera attribute
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            showMessage("Camera access denied. Please allow camera access in your browser settings.", 'error');
            openCameraFallback();
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            showMessage("No camera found on your device.", 'error');
            openCameraFallback();
        } else {
            showMessage("Could not access camera. Please try uploading a file instead.", 'error');
        }
    }
}

/**
 * Creates the camera modal UI with video preview and controls
 * @returns {HTMLElement} The camera modal DOM element
 */
function createCameraModal() {
    const modal = document.createElement('div');
    modal.className = 'camera-modal-overlay';
    modal.innerHTML = `
        <div class="camera-modal">
            <div class="camera-header">
                <h3>Take a Photo</h3>
                <button class="close-camera" id="cancel-camera">&times;</button>
            </div>
            <div class="camera-preview">
                <video id="camera-feed" autoplay playsinline></video>
                <canvas id="photo-canvas" style="display: none;"></canvas>
                <div id="photo-preview" class="photo-preview" style="display: none;"></div>
            </div>
            <div class="camera-controls">
                <div class="camera-buttons">
                    <button class="capture-btn" id="capture-btn">
                        <i class="fas fa-camera"></i>
                    </button>
                    <button class="camera-control-btn" id="retake-btn" style="display: none;">
                        <i class="fas fa-redo"></i>
                        <span>Retake</span>
                    </button>
                </div>
                <div class="camera-action-buttons" style="display: none;">
                    <button class="btn-secondary" id="use-photo-btn">
                        <i class="fas fa-check"></i>
                        <span>Use Photo</span>
                    </button>
                </div>
            </div>
            <div class="camera-instructions">
                <p>Position your face in the frame and click the camera button</p>
            </div>
        </div>
    `;
    return modal;
}

/**
 * Captures a still image from the camera video stream
 * Draws the current frame to a canvas and shows preview
 * @param {HTMLVideoElement} videoElement - The video stream element
 * @param {HTMLElement} modal - The camera modal element
 */
function capturePhoto(videoElement, modal) {
    const canvas = modal.querySelector('#photo-canvas');
    const photoPreview = modal.querySelector('#photo-preview');
    const captureBtn = modal.querySelector('#capture-btn');
    const retakeBtn = modal.querySelector('#retake-btn');
    const usePhotoBtn = modal.querySelector('#use-photo-btn');
    const actionButtons = modal.querySelector('.camera-action-buttons');
    
    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Hide video, show captured photo
    videoElement.style.display = 'none';
    photoPreview.style.display = 'block';
    photoPreview.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`;
    
    // Toggle buttons - Make sure all buttons are visible correctly
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'flex'; // Make sure this shows
    actionButtons.style.display = 'flex'; // Make sure this shows
    
    // Show use photo button and setup click handler
    usePhotoBtn.style.display = 'flex';
    
    // Setup retake button - Use a proper function to avoid scope issues
    retakeBtn.onclick = function() {
        photoPreview.style.display = 'none';
        videoElement.style.display = 'block';
        captureBtn.style.display = 'flex';
        retakeBtn.style.display = 'none';
        actionButtons.style.display = 'none';
        usePhotoBtn.style.display = 'none';
        
        // Restart camera
        restartCamera(videoElement);
    };
    
    // Setup use photo button with a proper handler
    usePhotoBtn.onclick = function() {
        useCapturedPhoto(canvas, modal);
    };
}

/**
 * Uploads the captured photo to Firebase Storage
 * Converts canvas to blob, creates file, and calls upload function
 * @param {HTMLCanvasElement} canvas - Canvas element containing the captured image
 * @param {HTMLElement} modal - The camera modal element to close after upload
 */
async function useCapturedPhoto(canvas, modal) {
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
        if (blob) {
            closeCameraModal(modal);
            showProgress(true);
            
            try {
                // Create file from blob
                const file = new File([blob], `camera_photo_${Date.now()}.png`, { 
                    type: 'image/png' 
                });
                
                // Upload to Firebase
                const result = await uploadProfilePicture(currentUser.uid, file);
                
                if (result.success) {
                    displayProfilePicture(result.url);
                    showMessage(result.message || 'Profile picture updated!', 'success');
                } else {
                    showMessage(result.message, 'error');
                }
            } catch (error) {
                console.error("Upload error:", error);
                showMessage("Failed to upload photo. Please try again.", 'error');
            } finally {
                showProgress(false);
            }
        }
    }, 'image/png', 0.9); // 90% quality
}

/**
 * Restarts the camera stream for retaking a photo
 * Re-requests user media after camera was previously stopped
 * @param {HTMLVideoElement} videoElement - The video stream element
 * @returns {Promise<boolean>} Success status
 */
async function restartCamera(videoElement) {
    try {
        // Get current constraints from previous stream
        const currentConstraints = cameraStream 
            ? cameraStream.getVideoTracks()[0].getSettings()
            : { 
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
        
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: currentConstraints,
            audio: false 
        });
        
        videoElement.srcObject = cameraStream;
        videoElement.onloadedmetadata = () => {
            videoElement.play().catch(e => console.log("Video restart error:", e));
        };
        
        return true;
    } catch (error) {
        console.error("Failed to restart camera:", error);
        throw error;
    }
}

/**
 * Closes the camera modal and stops the camera stream
 * Stops all media tracks and removes the modal from DOM
 * @param {HTMLElement} modal - The camera modal element
 */
function closeCameraModal(modal) {
    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    // Remove modal from DOM
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

/**
 * Fallback camera method using file input with capture attribute
 * Used on mobile devices when MediaDevices API fails
 * Attempts to use native camera picker on Android/iOS
 */
function openCameraFallback() {
    const tempInput = document.createElement('input');
    tempInput.type = 'file';
    tempInput.accept = 'image/*';
    
    // Try to use capture attribute (works on some mobile devices)
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
        tempInput.capture = 'user';
    }
    
    tempInput.onchange = (e) => {
        handleFileSelect(e, 'camera-fallback');
        if (tempInput.parentNode) {
            tempInput.parentNode.removeChild(tempInput);
        }
    };
    
    tempInput.style.display = 'none';
    document.body.appendChild(tempInput);
    tempInput.click();
}

// ============================================
// UI Helper Functions
// ============================================

/**
 * Shows or hides the upload progress bar
 * Animates the progress fill when showing
 * @param {boolean} show - Whether to show or hide the progress bar
 */
function showProgress(show) {
    const progressDiv = document.getElementById('upload-progress');
    if (progressDiv) {
        progressDiv.style.display = show ? 'block' : 'none';
        
        // Animate progress bar
        if (show) {
            const progressFill = progressDiv.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.animation = 'progressAnimation 2s infinite';
            }
        }
    }
}

/**
 * Displays a temporary message to the user
 * Auto-hides after 5 seconds
 * @param {string} text - Message text to display
 * @param {string} type - Message type (success, error)
 */
function showMessage(text, type) {
    const messageDiv = document.getElementById('upload-message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `upload-message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// ============================================
// Global Exports
// ============================================

// Make camera function globally accessible for onclick handlers
window.openCameraWithMediaDevices = openCameraWithMediaDevices;