/**
 * User Profile Module
 * Displays user profile information from Firebase Database
 * Renders tools, mineral samples, scores, and achievements
 * Integrates with Firebase Authentication and real-time database
 */

// Import Firebase authentication and database functions
import { auth, watchAuthState, logoutUser, db } from './firebase-auth.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// ============================================
// Data Mappings and Configuration
// ============================================

// Maps sample/tool names to their image file paths
const sampleImages = {
    'basalt': 'images/basalt.png',
    'carbonateRock': 'images/carbonateRock.png',
    'gypsum': 'images/gypsum.png',
    'regolith': 'images/regolith.png',
    'smeciteClay': 'images/smeciteClay.png',
    'water': 'images/water.png',
    
    // Tool images
    'repairTool': 'images/repairTool.png',
    'wiperTool': 'images/wiperTool.png',
    'extractor': 'images/extractor.png',
};

// ============================================
// Utility Functions
// ============================================

/**
 * Converts camelCase or snake_case names to readable text
 * Example: 'smeciteClay' -> 'Smecite Clay'
 * @param {string} name - The name to format
 * @returns {string} Formatted name
 */
// Helper function to format names nicely
function formatName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

/**
 * Maps achievement keys to their badge image file paths
 */
// Add achievement images mapping 
const achievementImages = {
    'firstDrill': 'images/achievements/firstdrillbadge.png',
    'perfectDrill': 'images/achievements/perfectdrillbadge.png',
    'basaltMaster': 'images/achievements/rock1.png',
    'carbonateMaster': 'images/achievements/rock2.png',
    'clayMaster': 'images/achievements/rock3.png',
    'gypsumMaster': 'images/achievements/rock4.png',
    'waterMaster': 'images/achievements/rock5.png',
    'regolithMaster': 'images/achievements/rock6.png',
    'allRocksMastered': 'images/achievements/allrocksbadge.png',
};

/**
 * Defines achievement titles and descriptions
 * Displayed to users regardless of unlock status
 */
// Add achievement titles and descriptions 
const achievementInfo = {
    'firstDrill': {
        title: 'First Drill',
        description: 'Complete your first drilling operation'
    },
    'perfectDrill': {
        title: 'Perfect Drill',
        description: 'Achieve 100% on any drill'
    },
    'regolithMaster': {
        title: 'Regolith Master',
        description: 'Reach level 3 info for Regolith'
    },
    'basaltMaster': {
        title: 'Basalt Master',
        description: 'Reach level 3 info for Basalt'
    },
    'gypsumMaster': {
        title: 'Gypsum Master',
        description: 'Reach level 3 info for Gypsum'
    },
    'clayMaster': {
        title: 'Clay Master',
        description: 'Reach level 3 info for Smectite Clay'
    },
    'carbonateMaster': {
        title: 'Carbonate Master',
        description: 'Reach level 3 info for Carbonate Rock'
    },
    'waterMaster': {
        title: 'Water Master',
        description: 'Reach level 3 info for Water'
    },
    'allRocksMastered': {
        title: 'Mars Geologist',
        description: 'Master all rock types (level 3 info for all)'
    }
};

/**
 * Formats ISO date strings into readable locale-specific format
 * Example: '2024-12-15T10:30:00Z' -> 'Dec 15, 2024'
 * @param {string} dateString - ISO format date string
 * @returns {string} Formatted date or empty string if invalid
 */
// Add this helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return '';
    }
}

// ============================================
// Authentication State Management
// ============================================

/**
 * Watches for authentication state changes
 * Loads user profile when user is authenticated
 * Redirects to login page if user logs out
 */
// Watch for authentication state changes
watchAuthState(async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        await loadUserProfile(user.uid);
    } else {
        // No user is signed in, redirect to login
        window.location.href = "index.html"; 
    }
});

// ============================================
// Data Loading Functions
// ============================================

/**
 * Fetches user profile data from Firebase Realtime Database
 * Includes profile info, inventory, scores, and achievements
 * @param {string} uid - The user's Firebase UID
 */
// Load user profile from Firebase
async function loadUserProfile(uid) {
    const userRef = ref(db, `users/${uid}`);
    
    try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            displayData(data);
        } else {
            console.error("No data found at this path.");
            document.getElementById('loading').innerText = "No profile found in database.";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/**
 * Displays all user profile data on the page
 * Renders welcome name, profile info, and all content sections
 * @param {Object} data - Complete user data from Firebase
 */
// Display all user data on the page
function displayData(data) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';

    // Welcome name from email
    const email = data.profile?.email || "Explorer";
    const displayName = email.includes('@') ? email.split('@')[0] : email;
    document.getElementById('welcome-name').innerText = displayName;

    // Profile info
    document.getElementById('display-email').innerText = data.profile?.email || "N/A";
    
    // Format dates nicely
    const accountCreated = data.profile?.accountCreated ? 
        new Date(data.profile.accountCreated).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : "N/A";
    
    const lastLogin = data.profile?.lastLogin ? 
        new Date(data.profile.lastLogin).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : "N/A";
    
    document.getElementById('display-created').innerText = accountCreated;
    document.getElementById('display-login').innerText = lastLogin;

    // Display all sections
    displayTools(data);
    displaySamples(data);
    displayScores(data);
    displayAchievements(data);
}

// ============================================
// Content Rendering Functions
// ============================================

/**
 * Renders user's tools/equipment from inventory
 * Supports both array and object formats from database
 * @param {Object} data - User data object containing inventory
 */
// Display tools from inventory
function displayTools(data) {
    const tools = data.inventory?.tools;
    const toolsGrid = document.getElementById('tools-grid');
    toolsGrid.innerHTML = '';
    
    if (tools && (Array.isArray(tools) || Object.keys(tools).length > 0)) {
        let toolItems = [];
        
        if (Array.isArray(tools)) {
            // Array format: ["repairTool", "wiperTool", "extractor"]
            toolItems = tools.map(toolName => ({ name: toolName, owned: true }));
        } else {
            // Object format: { "toolName": true/false }
            toolItems = Object.entries(tools).map(([name, owned]) => ({ 
                name, 
                owned: owned === true 
            }));
        }
        
        for (const tool of toolItems) {
            const toolCard = document.createElement('div');
            toolCard.className = 'tool-card';
            
            const imageSrc = sampleImages[tool.name] || 'images/default-tool.png';
            const formattedName = formatName(tool.name);
            
            toolCard.innerHTML = `
                <img src="${imageSrc}" alt="${formattedName}" class="tool-icon">
                <h4>${formattedName}</h4>
            `;
            
            toolsGrid.appendChild(toolCard);
        }
    } else {
        toolsGrid.innerHTML = `
            <div class="no-data" style="grid-column: 1 / -1;">
                <p>No tools found</p>
                <p style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">Tools will appear here when collected</p>
            </div>
        `;
    }
}

/**
 * Renders mineral samples with amount and high score
 * Handles different data formats from database
 * @param {Object} data - User data object containing inventory samples
 */
// Display mineral samples from inventory
function displaySamples(data) {
    const samples = data.inventory?.samples;
    const samplesGrid = document.getElementById('samples-grid');
    samplesGrid.innerHTML = '';
    
    if (samples && Object.keys(samples).length > 0) {
        for (const [sampleKey, sampleData] of Object.entries(samples)) {
            const sampleCard = document.createElement('div');
            sampleCard.className = 'sample-card';
            
            const imageSrc = sampleImages[sampleKey] || 'images/default-sample.png';
            const formattedName = formatName(sampleKey);
            
            // Get amount and high score
            let amount = 0;
            let highScore = 0;
            
            if (typeof sampleData === 'object' && sampleData !== null) {
                amount = sampleData.amount || 0;
                highScore = sampleData.highScore || 0;
            } else if (typeof sampleData === 'number') {
                amount = sampleData;
            }
            
            sampleCard.innerHTML = `
                <div class="sample-header">
                    <img src="${imageSrc}" alt="${formattedName}" class="sample-icon">
                    <h4>${formattedName}</h4>
                </div>
                <div class="sample-stats">
                    <div class="stat-item amount">
                        <span class="stat-label">Amount</span>
                        <span class="stat-value">${amount}</span>
                    </div>
                    <div class="stat-item high-score">
                        <span class="stat-label">High Score</span>
                        <span class="stat-value">${highScore.toFixed(1)}</span>
                    </div>
                </div>
            `;
            
            samplesGrid.appendChild(sampleCard);
        }
    } else {
        samplesGrid.innerHTML = `
            <div class="no-data" style="grid-column: 1 / -1;">
                <p>No mineral samples found</p>
                <p style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">Start exploring Mars to collect samples!</p>
            </div>
        `;
    }
}

/**
 * Renders user scores section
 * Formats total score to 2 decimal places
 * @param {Object} data - User data object containing scores
 */
// Display scores section
function displayScores(data) {
    const scores = data.scores;
    const scoresGrid = document.getElementById('scores-grid');
    scoresGrid.innerHTML = '';
    
    if (scores && Object.keys(scores).length > 0) {
        for (const [scoreKey, scoreValue] of Object.entries(scores)) {
            const scoreCard = document.createElement('div');
            scoreCard.className = 'score-card';
            
            const formattedKey = formatName(scoreKey);
            let displayValue = scoreValue;
            
            // Format total score as float with 2 decimals
            if (scoreKey === 'totalScore' && typeof scoreValue === 'number') {
                displayValue = scoreValue.toFixed(2);
            }
            
            scoreCard.innerHTML = `
                <h4>${formattedKey}</h4>
                <div class="score-value">${displayValue}</div>
            `;
            
            scoresGrid.appendChild(scoreCard);
        }
    } else {
        scoresGrid.innerHTML = `
            <div class="no-data" style="grid-column: 1 / -1;">
                <p>No scores recorded yet</p>
                <p style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">Complete missions to earn scores!</p>
            </div>
        `;
    }
}

/**
 * Renders achievements with locked/unlocked states
 * Displays achievement cards with unlock dates and descriptions
 * Handles multiple data formats (boolean, object, number, string)
 * @param {Object} data - User data object containing achievements
 */
// Display achievements with locked/unlocked states
function displayAchievements(data) {
    const achievements = data.achievements || {};
    const achievementsGrid = document.getElementById('achievements-grid');
    
    if (!achievementsGrid) {
        console.warn('Achievements grid element not found in the HTML');
        return;
    }
    
    achievementsGrid.innerHTML = '';
    
    // List of all possible achievements
    const allAchievements = [
        'firstDrill',
        'perfectDrill',
        'regolithMaster',
        'basaltMaster',
        'gypsumMaster',
        'clayMaster',
        'carbonateMaster',
        'waterMaster',
        'allRocksMastered'
    ];
    
    // Check if user has any achievements data
    if (Object.keys(achievements).length > 0 || allAchievements.length > 0) {
        allAchievements.forEach(achievementKey => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'achievement-card';
            
            // Check if achievement is unlocked
            let isUnlocked = false;
            let unlockDate = null;
            let score = 0;
            
            if (achievements[achievementKey] !== undefined) {
                const achievementData = achievements[achievementKey];
                
                // Check the format - could be boolean or object
                if (typeof achievementData === 'boolean') {
                    isUnlocked = achievementData;
                } else if (typeof achievementData === 'object') {
                    // Object format from DatabaseManager.cs
                    isUnlocked = achievementData.unlocked === true;
                    unlockDate = achievementData.unlockDate || null;
                    score = achievementData.score || 0;
                } else if (typeof achievementData === 'number') {
                    isUnlocked = achievementData === 1;
                } else if (typeof achievementData === 'string') {
                    // If it's just a date string, treat it as unlocked
                    isUnlocked = true;
                    unlockDate = achievementData;
                }
            }
            
            // Get achievement info - always get the description even when locked
            const info = achievementInfo[achievementKey] || { 
                title: formatName(achievementKey), 
                description: 'Complete the challenge to unlock this achievement' 
            };
            
            // Get image - use default if not found
            const imageSrc = achievementImages[achievementKey] || 'images/default-achievement.png';
            
            // Format the unlock date
            let formattedDate = 'Not yet unlocked';
            if (isUnlocked && unlockDate) {
                try {
                    formattedDate = formatDate(unlockDate);
                    if (formattedDate === '') {
                        formattedDate = 'Unknown date';
                    }
                } catch (error) {
                    console.warn(`Could not parse date for ${achievementKey}:`, unlockDate);
                    formattedDate = 'Unknown date';
                }
            } else if (isUnlocked) {
                formattedDate = 'Unknown date'; // Unlocked but no date recorded
            }
            
            // Add locked class if not unlocked
            if (!isUnlocked) {
                achievementCard.classList.add('locked');
            }
            
            achievementCard.innerHTML = `
                <div class="achievement-header">
                    <img src="${imageSrc}" alt="${info.title}" class="achievement-icon">
                    <div class="achievement-title-container">
                        <h4 class="achievement-title">${isUnlocked ? info.title : 'Locked'}</h4>
                        ${isUnlocked ? `<p class="achievement-date">Unlocked: ${formattedDate}</p>` : ''}
                    </div>
                </div>
                <div class="achievement-body">
                    <p class="achievement-desc">${info.description}</p> <!-- Always show the description -->
                    ${isUnlocked && score > 0 ? `<p class="achievement-score">Score: ${score.toFixed(1)}</p>` : ''}
                </div>
            `;
            
            achievementsGrid.appendChild(achievementCard);
        });
    } else {
        achievementsGrid.innerHTML = `
            <div class="no-data" style="grid-column: 1 / -1;">
                <p>No achievements yet</p>
                <p style="font-size: 0.9rem; color: rgba(255,255,255,0.5);">Complete challenges to earn achievements!</p>
            </div>
        `;
    }
}

// ============================================
// Event Listeners
// ============================================

// Logout button - signs user out and redirects to home page
document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser().then(() => {
        window.location.href = "index.html";
    });
});