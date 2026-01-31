import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

gsap.registerPlugin(ScrollTrigger);

// --- SCENE & CAMERA ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xe8a082, 0.05);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15; 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

const clock = new THREE.Clock(); // Added for consistent rotation speed

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffdca8, 3);
sunLight.position.set(8, 3, -8); 
scene.add(sunLight);

// --- LOAD MARS ---
const loader = new GLTFLoader();
let mars;

loader.load('./mars.glb', (gltf) => {
    mars = gltf.scene;

    // INITIAL STATE: Bottom of the screen
    mars.scale.set(1.9, 1.9, 1.9); 
    mars.position.set(0, -11, 0); 
    
    scene.add(mars);
    setupScrollAnimation();
});

function setupScrollAnimation() {
    // Create a master timeline for the whole page scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 // Adds a smooth "lag" for a more cinematic feel
        }
    });

    // PHASE 1: Move from Bottom to Right Side (Hero -> Details)
    tl.to(mars.position, {
        x: 6,
        y: 0,
        z: 0,
        ease: "none"
    }, 0);

    tl.to(mars.scale, {
        x: 0.8,
        y: 0.8,
        z: 0.8,
        ease: "none"
    }, 0);

    // Scroll-based rotation
    tl.to(mars.rotation, {
        y: Math.PI * 2,
        ease: "none"
    }, 0);

    // Fade out Hero Content
    tl.to(".hero-content", { opacity: 0, y: -100, ease: "none" }, 0);

    // PHASE 2: Expand to Full Screen (Details -> Full View)
    // This starts at the 60% mark (0.6) of the scroll timeline
    tl.to(mars.position, {
        x: 0,
        y: 0,
        z: 6, // Bringing it closer to camera to "fill" the screen
        ease: "power2.inOut"
    }, 0.6);

    tl.to(mars.scale, {
        x: 1, // Make it large enough to cover the viewport
        y: 1,
        z: 1,
        ease: "power2.inOut"
    }, 0.6);

    // Fade out details text and fade in final content
    tl.to(".text-column", { opacity: 0, x: -50, ease: "none" }, 0.6);
    tl.to(".full-view-content", { opacity: 1, y: 0, ease: "power2.out" }, 0.8);
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta(); // Time-based movement for consistent speed
    
    if (mars) {
        // Constant slow idle spin (0.1 radians per second)
        mars.rotation.y += 0.1 * delta; 
    }
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});