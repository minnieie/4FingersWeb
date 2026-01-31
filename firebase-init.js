import { auth, loginUser, signupUser, logoutUser, watchAuthState } from './firebase-auth.js';

// Get modal elements
const authModal = document.getElementById('auth-modal');
const closeModal = document.querySelector('.close-modal');
const loginTrigger = document.getElementById('login-trigger');
const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');
const userEmail = document.getElementById('user-email');
const userPass = document.getElementById('user-pass');
const authMessage = document.getElementById('auth-message');

// Modal functions
function showModal() {
    authModal.style.display = 'flex';
    // Small GSAP pop effect
    gsap.fromTo(".modal-content", 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
    );
    userEmail.value = '';
    userPass.value = '';
    authMessage.textContent = '';
}

function hideModal() {
    authModal.style.display = 'none';
}

// Event Listeners for UI
loginTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    showModal();
});

closeModal.addEventListener('click', hideModal);

// Handle Login
btnLogin.addEventListener('click', async () => {
    try {
        await loginUser(userEmail.value, userPass.value);
        authMessage.textContent = "Welcome back, Commander!";
        authMessage.style.color = "#4CAF50";
        setTimeout(hideModal, 1500);
    } catch (error) {
        authMessage.textContent = error.message;
        authMessage.style.color = "#ff6b6b";
    }
});

// Handle Signup
btnSignup.addEventListener('click', async () => {
    try {
        await signupUser(userEmail.value, userPass.value);
        authMessage.textContent = "Account created! Welcome, Explorer.";
        authMessage.style.color = "#4CAF50";
        setTimeout(hideModal, 1500);
    } catch (error) {
        authMessage.textContent = error.message;
        authMessage.style.color = "#ff6b6b";
    }
});

// Update UI based on Auth State
watchAuthState((user) => {
    if (user) {
        const username = user.email.split('@')[0];
        loginTrigger.textContent = `Welcome, ${username}`;
        
        // When clicked, redirect to user.html (dashboard)
        loginTrigger.onclick = (e) => {
            e.preventDefault();
            window.location.href = 'user.html'; // Redirect to dashboard
        };
    } else {
        loginTrigger.textContent = "Login";
        loginTrigger.onclick = (e) => { 
            e.preventDefault(); 
            showModal(); 
        };
    }
});