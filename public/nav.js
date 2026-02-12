/**
 * Navigation Module
 * Handles hamburger menu toggle, mobile navigation, and basic modal interactions
 * This file provides fallback navigation functionality alongside firebase-init.js
 */

// Initialize navigation when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // ============================================
    // DOM Element References
    // ============================================
    
    // Hamburger menu button
    const hamburger = document.getElementById('hamburger');
    
    // Navigation links container
    const navLinks = document.getElementById('nav-links');
    
    // Login button in navigation bar
    const loginTrigger = document.getElementById('login-trigger');
    
    // Authentication modal overlay
    const authModal = document.getElementById('auth-modal');
    
    // Close button for modal
    const closeModal = document.querySelector('.close-modal');
    
    // ============================================
    // Hamburger Menu Toggle
    // ============================================
    
    // Toggle mobile menu visibility and hamburger animation when burger icon is clicked
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // ============================================
    // Mobile Menu - Close on Link Click
    // ============================================
    
    // Close mobile menu when user clicks on any navigation link
    const navLinkElements = document.querySelectorAll('.nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // ============================================
    // Modal Management
    // ============================================
    
    // Open authentication modal when login button is clicked
    // Prevents page scrolling while modal is open
    if (loginTrigger) {
        loginTrigger.addEventListener('click', function() {
            if (authModal) {
                authModal.style.display = 'flex';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            }
        });
    }
    
    // Close authentication modal when X button is clicked
    // Re-enable page scrolling when modal closes
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        });
    }
    
    // Close authentication modal when clicking on the backdrop (outside modal content)
    // Re-enable page scrolling when modal closes
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                authModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // ============================================
    // Form Toggle - Login/Signup
    // ============================================
    
    // DOM elements for form switching
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const modalTitle = document.getElementById('modal-title');
    
    // Switch to signup form when user clicks "Create Account" button
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function() {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            modalTitle.textContent = 'Join the Mission';
        });
    }
    
    // Switch to login form when user clicks "Back to Login" button
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function() {
            signupForm.style.display = 'none';
            loginForm.style.display = 'block';
            modalTitle.textContent = 'Welcome, Explorer';
        });
    }
});