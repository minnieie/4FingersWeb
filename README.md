# Rocks & Deepspace - Mars Educational Simulation

## 📋 Project Overview

**Rocks & Deepspace** is a Year 2.2 integrated project by **4Fingers** that combines Unity XR development, Firebase backend systems, 3D environment creation, and UX design. It is an educational Mars simulation designed to help students learn about rocks found on Mars, discover new scientific information, and explore Mars's potential habitability.

This repository contains the **web frontend** for the project, featuring user authentication, profile management, leaderboards, and an interactive 3D Mars visualization.

🔗 **YouTube Playlist**: [Watch the Project Playlist](https://www.youtube.com/watch?v=NVLKzwUMOH4&list=PLINnVyngB5bSuYTGmouNHwZvJT7U7CqxN)  
📱 **Unity Version**: [4Fingers Unity Repository](https://github.com/Bfejwind/4Fingers)  
🌐 **Live Demo**: [https://nothing-b62c1.web.app/](https://nothing-b62c1.web.app/)

---

## ✨ Features

### 🌟 Core Features
| Feature | Description |
|---------|-------------|
| **User Authentication** | Email/password signup and login with Firebase Auth |
| **Persistent User Profiles** | User data stored in Firebase Realtime Database |
| **3D Mars Visualization** | Interactive scroll-based Mars model using Three.js |
| **Leaderboard System** | Global rankings with filtering by rock types |
| **Profile Management** | View tools, collected samples, scores, and achievements |
| **Profile Pictures** | Upload from device or capture via camera |
| **Achievement System** | Track player progress and unlocked badges |

### 🎮 Game Data Integration
- Exact data structure matching Unity version (DatabaseManager.cs)
- Mineral samples tracking (amount and high scores per rock type)
- Tool inventory management
- Score tracking with total and per-rock scores
- Achievement unlock dates and scores

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure |
| **CSS3** | Styling with responsive design |
| **JavaScript (ES6 Modules)** | Core functionality |
| **Three.js** | 3D Mars visualization |
| **GSAP** | Scroll-triggered animations |

### Backend & Services
| Service | Purpose |
|---------|---------|
| **Firebase Authentication** | User management |
| **Firebase Realtime Database** | User data storage |
| **Firebase Cloud Storage** | Profile picture storage |

### External Libraries & Assets
- **Google Fonts** - Cinzel & Montserrat fonts
- **Font Awesome** - Icons for UI elements
- **Mars 3D Model** - [Mars by Sketchfab](https://sketchfab.com/3d-models/mars-5fc8b7168b044527a05ed3903c998b65)

---

## 📄 Pages & Functionality

### 🏠 Home Page (`index.html`)
- Interactive 3D Mars model that animates based on scroll
- Three sections: Hero, Details, Full View
- Scroll-triggered animations using GSAP

### 📊 Leaderboard Page (`leaderboard.html`)
- Global rankings of all explorers
- Filter by rock type (Basalt, Regolith, Smecite Clay, Gypsum, Carbonate Rock)
- Statistics: Top score, Average score, Total explorers
- Auto-refresh every 30 seconds

### 👤 User Profile Page (`user.html`)
- **Profile Picture**: Upload from file or take photo with camera
- **User Stats**: Email, account creation date, last login
- **Tools**: Display owned tools (repairTool, wiperTool, extractor)
- **Mineral Samples**: Amount collected and high scores per rock
- **Scores**: Total score display
- **Achievements**: Locked/unlocked badges with unlock dates
- **Logout**: Secure sign-out

### 📞 Contact Page (`contactus.html`)
- Project description
- Team member information with roles
- Project office communications

---

## 🔐 Authentication Flow

### Login Process
1. User clicks "Login" in navigation
2. Modal appears with login form
3. Credentials validated against Firebase
4. On success: Redirect to `user.html`

### Signup Process
1. User clicks "Create Account" in modal
2. Enter email, password, confirm password
3. Password validation (min 6 characters, match confirmation)
4. Firebase creates account
5. User profile created in database (matching Unity structure)
6. Auto-login and redirect to `user.html`

---

## 🌍 3D Visualization

### Three.js Mars Model
- **Model**: `mars.glb` (GLB format) from Sketchfab
- **Scene Setup**: Camera, lighting, fog effects

### Scroll Animation
GSAP ScrollTrigger with 3 phases:
1. **Hero to Details**: Mars moves from bottom-left to right side, shrinks
2. **Details to Full View**: Mars expands and moves closer to camera
3. **Full View**: Mars fills the screen

### Key Features
- Exponential fog for depth effect (Mars sunset colors)
- Directional lighting with warm Mars colors
- Idle rotation when not scrolling
- Responsive design (adapts to window resize)

## 📸 Profile Picture Management

### Features
- **Upload from file**: JPG, PNG, GIF (max 5MB)
- **Take photo**: Camera capture with live preview
- **Remove picture**: Delete from storage and database

### Camera Modal
1. User clicks "Take Photo"
2. Camera access requested
3. Live preview displayed
4. Capture button takes photo
5. Retake or use photo options
6. Uploads to Firebase Storage
## 🏆 Leaderboard System

### Features
- Real-time data fetching from Firebase
- Filter by rock type
- Statistics calculation (top score, average, explorer count)
- Auto-refresh every 30 seconds
- Manual refresh with button

### Sorting Logic
- **Total Score**: Sort by `scores.totalScore`
- **Individual Rocks**: Sort by `inventory.samples.{rock}.highScore`

### Display
- Rank 1-3 have special styling (gold, silver, bronze)
- Explorer avatars show first letter of username
- Sample count displayed
- Last updated timestamp

## 📱 Mobile Responsiveness

### Breakpoints

| Device | Screen Width | Optimizations |
|--------|-------------|---------------|
| Desktop | ≥1200px | Full layout |
| Tablet Landscape | 768-991px | Stacked layout |
| Tablet Portrait | 576-767px | Mobile navigation |
| Mobile | <576px | Compact UI |

### Mobile Navigation
- Hamburger menu appears on screens ≤768px
- Slide-out navigation panel
- Smooth animations
- Overlay backdrop

## 🤝 Team Members

- **Richard Wong** - Project Lead, Back End Developer, Unity
- **Toh Rui Min** - Database, Website, Firebase, Unity
- **Geng Bai Hui** - UI/UX Designer, Figma, Unity, Canva
- **Mei Yifan** - 3D Designer, Maya, Blender, Unity

## 📝 License

© 2026 4Fingers Rocks & Deepspace Project | Educational Research Only

This project is created for educational purposes as part of an academic integrated project. All rights reserved.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for authentication and database services
- [Three.js](https://threejs.org/) for 3D rendering capabilities
- [GSAP](https://greensock.com/gsap/) for smooth scroll animations
- [Sketchfab](https://sketchfab.com/) for the Mars 3D model
- [Google Fonts](https://fonts.google.com/) for typography
- [Font Awesome](https://fontawesome.com/) for icons

---

**Built with ❤️ for space exploration education**

