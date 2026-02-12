/**
 * Three.js Mars Visualization
 * Renders an interactive 3D Mars model that animates based on page scroll
 * Uses GSAP ScrollTrigger for scroll-linked animations
 * Features: Scroll-based positioning, rotation, scaling, and fade effects
 */

// Import Three.js library and GLTF model loader
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Register GSAP ScrollTrigger plugin for scroll-based animations
gsap.registerPlugin(ScrollTrigger);

// ============================================
// Three.js Scene Setup
// ============================================

// Create main 3D scene
const scene = new THREE.Scene();

// Add exponential fog for depth effect (Mars sunset colors)
scene.fog = new THREE.FogExp2(0xe8a082, 0.05);

// Create perspective camera (60 degree FOV, responsive aspect ratio)
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Position camera 15 units back on Z-axis to view the scene
camera.position.z = 15; 

// Create WebGL renderer with antialiasing and transparency support
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
// Set renderer size to fill the window
renderer.setSize(window.innerWidth, window.innerHeight);
// Use device pixel ratio for sharp rendering on high-DPI screens
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Append canvas to the container div
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Clock for timing animations and consistent frame-rate independent movement
const clock = new THREE.Clock();

// ============================================
// Lighting Setup
// ============================================

// Ambient light provides overall scene illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// Directional light mimics the Sun with warm Mars colors
const sunLight = new THREE.DirectionalLight(0xffdca8, 3);
// Position light to create dynamic shadows and highlights
sunLight.position.set(8, 3, -8); 
scene.add(sunLight);

// ============================================
// Mars Model Loading
// ============================================

// GLTF loader for loading 3D model files (.glb format)
const loader = new GLTFLoader();

// Reference to the Mars 3D model
let mars;

// Load the Mars model from public directory
loader.load('./mars.glb', (gltf) => {
    // Extract the scene from the GLTF file
    mars = gltf.scene;

    // Set initial scale and position for hero section animation
    // Mars starts large at the bottom of screen, will animate up
    mars.scale.set(1.9, 1.9, 1.9); 
    mars.position.set(0, -11, 0); 
    // Add Mars to scene and initialize scroll animations
    scene.add(mars);
    setupScrollAnimation();
});

/**
 * Sets up scroll-linked animation timeline using GSAP ScrollTrigger
 * Creates three main animation phases:
 * 1. Hero to Details: Mars moves right and shrinks
 * 2. Details to Full View: Mars expands and moves closer to camera
 * 3. Full view: Mars fills the screen
 */
function setupScrollAnimation() {
    // Create a master timeline synchronized with page scroll
    // 'scrub: 1.5' smooths animation based on scroll position
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            // Adds smooth lag effect for more cinematic feel (smooth out user scroll)
            scrub: 1.5
        }
    });

    // ============================================
    // PHASE 1: Hero to Details Section
    // Mars moves from bottom-left to right side of screen
    // ============================================
    
    // Move Mars position: right (+X), center vertically, keep at mid-depth
    tl.to(mars.position, {
        x: 6,
        y: 0,
        z: 0,
        ease: "none"
    }, 0);

    // Shrink Mars as it moves to the right (perspective effect)
    tl.to(mars.scale, {
        x: 0.8,
        y: 0.8,
        z: 0.8,
        ease: "none"
    }, 0);

    // Continuous rotation based on scroll (full 360 degree rotation)
    tl.to(mars.rotation, {
        y: Math.PI * 2,
        ease: "none"
    }, 0);

    // Fade out hero section text as user scrolls away
    tl.to(".hero-content", { opacity: 0, y: -100, ease: "none" }, 0);

    // ============================================
    // PHASE 2: Details to Full View Section
    // Mars expands to fill screen and moves closer to camera
    // Animation begins at 60% of total scroll progress
    // ============================================
    
    // Move Mars closer to camera and center on screen
    tl.to(mars.position, {
        x: 0,
        y: 0,
        // Move closer on Z-axis to create "zoom in" effect
        z: 6,
        ease: "power2.inOut"
    }, 0.6);

    // Scale Mars up to fill the viewport
    tl.to(mars.scale, {
        x: 1,
        y: 1,
        z: 1,
        ease: "power2.inOut"
    }, 0.6);

    // Fade out details section text as full-view section takes over
    tl.to(".text-column", { opacity: 0, x: -50, ease: "none" }, 0.6);
    
    // Fade in full-view content with gentle animation
    tl.to(".full-view-content", { opacity: 1, y: 0, ease: "power2.out" }, 0.8);
}

// ============================================
// Animation Loop
// ============================================

/**
 * Main animation frame loop
 * Handles idle rotation when not animating from scroll
 * Uses delta time for frame-rate independent movement
 */
function animate() {
    // Request next animation frame
    requestAnimationFrame(animate);
    
    // Get elapsed time since last frame for consistent speed
    const delta = clock.getDelta();
    
    // Apply gentle idle rotation to Mars when not scrolling
    if (mars) {
        // Rotate slowly (0.1 radians per second, delta-time independent)
        mars.rotation.y += 0.1 * delta; 
    }
    
    // Render the scene from the camera's perspective
    renderer.render(scene, camera);
}
// Start the animation loop
animate();

// ============================================
// Responsive Design
// ============================================

// Handle window resize to maintain correct aspect ratio and responsiveness
window.addEventListener('resize', () => {
    // Update camera aspect ratio based on new window dimensions
    camera.aspect = window.innerWidth / window.innerHeight;
    // Apply camera changes
    camera.updateProjectionMatrix();
    // Update renderer size to fill new window dimensions
    renderer.setSize(window.innerWidth, window.innerHeight);
});