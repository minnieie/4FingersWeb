import { auth, loginUser, signupUser, logoutUser, watchAuthState } from './firebase-auth.js';

// Get modal elements
const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const loginTrigger = document.getElementById('login-trigger');

// Form containers
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Login elements
const loginEmail = document.getElementById('login-email');
const loginPass = document.getElementById('login-pass');
const btnLogin = document.getElementById('btn-login');

// Signup elements
const signupEmail = document.getElementById('signup-email');
const signupPass = document.getElementById('signup-pass');
const signupConfirmPass = document.getElementById('signup-confirm-pass');
const btnSignup = document.getElementById('btn-signup');

// Toggle buttons
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');

// Message display
const authMessage = document.getElementById('auth-message');
const modalTitle = document.getElementById('modal-title');

// Modal functions
function showModal() {
    authModal.style.display = 'flex';
    gsap.fromTo(".modal-content", 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
    resetForms();
    authMessage.textContent = '';
}

function hideModal() {
    authModal.style.display = 'none';
}

function resetForms() {
    loginEmail.value = '';
    loginPass.value = '';
    signupEmail.value = '';
    signupPass.value = '';
    signupConfirmPass.value = '';
}

function showLoginForm() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    modalTitle.textContent = 'Welcome Back, Commander';
    authMessage.textContent = '';
}

function showSignupForm() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    modalTitle.textContent = 'Join the Mission';
    authMessage.textContent = '';
}

// Event Listeners
loginTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    showModal();
    showLoginForm();
});

closeModal.addEventListener('click', hideModal);

switchToSignup.addEventListener('click', () => {
    showSignupForm();
});

switchToLogin.addEventListener('click', () => {
    showLoginForm();
});

// Handle Login
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
        setTimeout(hideModal, 1500);
    } else {
        authMessage.textContent = result.message;
        authMessage.style.color = "#ff6b6b";
    }
});

// Handle Signup with password confirmation
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
    
    authMessage.textContent = "Preparing your ship...";
    authMessage.style.color = "#ffffff";

    const result = await signupUser(email, password);
    
    if (result.success) {
        authMessage.textContent = "Account created! Welcome, Explorer.";
        authMessage.style.color = "#4CAF50";
        
        // Optional: Automatically log in after signup
        // await loginUser(email, password);
        
        setTimeout(() => {
            hideModal();
            // Optionally redirect to user profile
            window.location.href = 'user.html';
        }, 1500);
    } else {
        authMessage.textContent = result.message;
        authMessage.style.color = "#ff6b6b";
    }
});

// Update UI based on Auth State
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

// Close modal when clicking outside
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideModal();
    }
});