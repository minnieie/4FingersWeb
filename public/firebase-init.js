/**
 * Firebase Authentication UI Initialization
 * Handles modal interactions, form validation, and authentication state management
 * Works on all pages (index.html, leaderboard.html, user.html, contactus.html)
 */

// Import authentication functions from firebase-auth module
import { auth, loginUser, signupUser, logoutUser, watchAuthState } from './public/firebase-auth.js';

// ============================================
// DOM Element References
// ============================================

// Modal and trigger elements
const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const loginTrigger = document.getElementById('login-trigger');

// Form containers for login and signup
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Login form input elements
const loginEmail = document.getElementById('login-email');
const loginPass = document.getElementById('login-pass');
const btnLogin = document.getElementById('btn-login');

// Signup form input elements
const signupEmail = document.getElementById('signup-email');
const signupPass = document.getElementById('signup-pass');
const signupConfirmPass = document.getElementById('signup-confirm-pass');
const btnSignup = document.getElementById('btn-signup');

// Form toggle buttons
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

// Message and title display elements
const authMessage = document.getElementById('auth-message');
const modalTitle = document.getElementById('modal-title');

// ============================================
// Modal Management Functions
// ============================================

/**
 * Opens the authentication modal with animation
 * Resets forms and clears previous messages
 */
function showModal() {
    authModal.style.display = 'flex';
    gsap.fromTo(".modal-content", 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
    resetForms();
    authMessage.textContent = '';
}

/**
 * Closes the authentication modal
 */
function hideModal() {
    authModal.style.display = 'none';
}

/**
 * Clears all form input values
 */
function resetForms() {
    loginEmail.value = '';
    loginPass.value = '';
    signupEmail.value = '';
    signupPass.value = '';
    signupConfirmPass.value = '';
}

/**
 * Displays the login form and hides the signup form
 */
function showLoginForm() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    modalTitle.textContent = 'Welcome Back, Commander';
    authMessage.textContent = '';
}

/**
 * Displays the signup form and hides the login form
 */
function showSignupForm() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    modalTitle.textContent = 'Join the Mission';
    authMessage.textContent = '';
}

// ============================================
// Event Listeners
// ============================================

// Login button click handler - opens modal with login form
loginTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    showModal();
    showLoginForm();
});

// Close button click handler
closeModal.addEventListener('click', hideModal);

// Form toggle buttons
switchToSignup.addEventListener('click', () => {
    showSignupForm();
});

switchToLogin.addEventListener('click', () => {
    showLoginForm();
});

// ============================================
// Authentication Handlers
// ============================================

/**
 * Handles login form submission
 * Validates input, calls loginUser function, and redirects on success
 */
btnLogin.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPass.value;
    
    if (!email || !password) {
        authMessage.textContent = "Please enter both email and password.";
        authMessage.style.color = "#ff6b6b";
        return;
    }
    
    authMessage.textContent = "Verifying credentials...";
    authMessage.style.color = "#ffffff";

    const result = await loginUser(email, password);
    
    if (result.success) {
        authMessage.textContent = "Welcome back, Commander!";
        authMessage.style.color = "#4CAF50";
        setTimeout(() => {
            hideModal();
            window.location.href = 'user.html';
        }, 1500);
    } else {
        authMessage.textContent = result.message;
        authMessage.style.color = "#ff6b6b";
    }
});

/**
 * Handles signup form submission
 * Validates input including password confirmation, creates account, and auto-logs in user
 */
btnSignup.addEventListener('click', async () => {
    const email = signupEmail.value.trim();
    const password = signupPass.value;
    const confirmPassword = signupConfirmPass.value;
    
    // Validation
    if (!email || !password || !confirmPassword) {
        authMessage.textContent = "Please fill in all fields.";
        authMessage.style.color = "#ff6b6b";
        return;
    }
    
    if (password !== confirmPassword) {
        authMessage.textContent = "Passwords don't match.";
        authMessage.style.color = "#ff6b6b";
        return;
    }
    
    if (password.length < 6) {
        authMessage.textContent = "Password must be at least 6 characters.";
        authMessage.style.color = "#ff6b6b";
        return;
    }
    
    authMessage.textContent = "Preparing your ship and creating profile...";
    authMessage.style.color = "#ffffff";

    const result = await signupUser(email, password);
    
    if (result.success) {
        authMessage.textContent = "Account created! Welcome, Explorer.";
        authMessage.style.color = "#4CAF50";
        
        // Automatically log in after signup
        const loginResult = await loginUser(email, password);
        
        if (loginResult.success) {
            setTimeout(() => {
                hideModal();
                // Redirect to user profile
                window.location.href = 'user.html';
            }, 1500);
        }
    } else {
        authMessage.textContent = result.message;
        authMessage.style.color = "#ff6b6b";
    }
});

// ============================================
// Auth State Management
// ============================================

/**
 * Watches for authentication state changes
 * Updates UI to show either logged-in or logged-out state
 * Changes login button to show username if logged in, or redirects to profile
 */
watchAuthState((user) => {
    if (user) {
        const username = user.email.split('@')[0];
        loginTrigger.textContent = `Welcome, ${username}`;
        loginTrigger.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'user.html';
        };
    } else {
        loginTrigger.textContent = "Login";
        loginTrigger.onclick = (e) => { 
            e.preventDefault(); 
            showModal();
            showLoginForm();
        };
    }
});

// ============================================
// Modal Backdrop Click Handler
// ============================================

// Close modal when clicking on the backdrop (outside the modal content)
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideModal();
    }
});