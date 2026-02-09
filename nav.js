// nav.js - Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const loginTrigger = document.getElementById('login-trigger');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.querySelector('.close-modal');
    
    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Login modal functionality
    if (loginTrigger) {
        loginTrigger.addEventListener('click', function() {
            if (authModal) {
                authModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        });
    }
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        });
    }
    
    // Close modal when clicking outside
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Switch between login and signup forms
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const modalTitle = document.getElementById('modal-title');
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function() {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            modalTitle.textContent = 'Join the Mission';
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function() {
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            modalTitle.textContent = 'Welcome, Explorer';
        });
    }
});