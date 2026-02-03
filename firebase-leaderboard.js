import { db } from './firebase-auth.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

let allUsersData = [];
let currentRock = 'totalScore';
const rockNames = {
    totalScore: 'Total Score',
    basalt: 'Basalt',
    water: 'Water',
    regolith: 'Regolith',
    smeciteClay: 'Smecite Clay',
    gypsum: 'Gypsum',
    carbonateRock: 'Carbonate Rock'
};

// DOM Elements
const leaderboardBody = document.getElementById('leaderboard-body');
const loadingElement = document.getElementById('loading');
const leaderboardContent = document.getElementById('leaderboard-content');
const noDataElement = document.getElementById('no-data');
const refreshBtn = document.getElementById('refresh-btn');
const rockTabs = document.querySelectorAll('.rock-tab');
const lastUpdatedTime = document.getElementById('last-updated-time');
const currentRockName = document.getElementById('current-rock-name');
const scoreHeader = document.getElementById('score-header');

// Initialize leaderboard
async function initLeaderboard() {
    try {
        await loadLeaderboardData();
        updateLastUpdatedTime();
        
        // Auto-refresh every 30 seconds
        setInterval(async () => {
            await loadLeaderboardData();
            updateLastUpdatedTime();
        }, 30000);
        
    } catch (error) {
        console.error("Error initializing leaderboard:", error);
        showErrorMessage("Failed to load leaderboard data");
    }
}

// Load leaderboard data from Firebase
async function loadLeaderboardData() {
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (!snapshot.exists()) {
            showNoData();
            return;
        }
        
        allUsersData = [];
        const users = snapshot.val();
        let userCount = 0;
        
        // Process each user
        for (const userId in users) {
            const user = users[userId];
            
            // Get profile data
            const email = user.profile?.email || 'Unknown Explorer';
            const accountCreated = user.profile?.accountCreated || new Date().toISOString();
            
            // Get total score
            let totalScoreValue = 0;
            if (user.scores && user.scores.totalScore) {
                totalScoreValue = parseFloat(user.scores.totalScore) || 0;
            }
            
            // Get individual rock high scores from Unity structure
            let rockScores = {};
            if (user.inventory && user.inventory.samples) {
                const samples = user.inventory.samples;
                
                // Extract high scores for each rock type
                for (const rockKey in samples) {
                    const sampleData = samples[rockKey];
                    if (sampleData && sampleData.highScore !== undefined) {
                        rockScores[rockKey] = parseFloat(sampleData.highScore) || 0;
                    }
                }
            }
            
            // Count total samples
            let totalSamples = 0;
            if (user.inventory && user.inventory.samples) {
                const samples = user.inventory.samples;
                for (const rockKey in samples) {
                    const sampleData = samples[rockKey];
                    if (sampleData && sampleData.amount !== undefined) {
                        totalSamples += parseInt(sampleData.amount) || 0;
                    }
                }
            }
            
            // Create user object for leaderboard
            const userData = {
                id: userId,
                email: email,
                displayName: email.split('@')[0],
                totalScore: totalScoreValue,
                rockScores: rockScores,
                totalSamples: totalSamples,
                accountCreated: accountCreated
            };
            
            allUsersData.push(userData);
            userCount++;
        }
        
        // Apply current rock filter and display
        applyRockFilter(currentRock);
        showLeaderboard();
        
    } catch (error) {
        console.error("Error loading leaderboard data:", error);
        showErrorMessage("Failed to connect to database");
    }
}

// Apply rock filter
function applyRockFilter(rockKey) {
    currentRock = rockKey;
    
    // Update active tab
    rockTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.rock === rockKey);
    });
    
    // Update current rock name display
    currentRockName.textContent = `${rockNames[rockKey].toUpperCase()} LEADERBOARD`;
    scoreHeader.textContent = rockKey === 'totalScore' ? 'Total Score' : 'High Score';
    
    let filteredData = [...allUsersData];
    let topScore = 0;
    let avgScore = 0;
    let totalScoreSum = 0;
    let userCount = 0;
    
    // Sort based on selected rock
    if (rockKey === 'totalScore') {
        // Sort by total score
        filteredData.sort((a, b) => b.totalScore - a.totalScore);
        
        // Calculate statistics for total score
        filteredData.forEach(user => {
            totalScoreSum += user.totalScore;
            userCount++;
            if (user.totalScore > topScore) topScore = user.totalScore;
        });
    } else {
        // Sort by individual rock high score
        filteredData.sort((a, b) => {
            const scoreA = a.rockScores[rockKey] || 0;
            const scoreB = b.rockScores[rockKey] || 0;
            return scoreB - scoreA;
        });
        
        // Calculate statistics for specific rock
        filteredData.forEach(user => {
            const rockScore = user.rockScores[rockKey] || 0;
            totalScoreSum += rockScore;
            userCount++;
            if (rockScore > topScore) topScore = rockScore;
        });
    }
    
    // Update statistics
    avgScore = userCount > 0 ? totalScoreSum / userCount : 0;
    document.getElementById('total-explorers').textContent = userCount;
    document.getElementById('top-score').textContent = topScore.toFixed(1);
    document.getElementById('avg-score').textContent = avgScore.toFixed(1);
    
    // Render leaderboard
    renderLeaderboard(filteredData, rockKey);
}

// Render leaderboard table
function renderLeaderboard(users, rockKey) {
    leaderboardBody.innerHTML = '';
    
    if (users.length === 0) {
        showNoData();
        return;
    }
    
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        
        // Add rank-specific class
        if (rank === 1) row.classList.add('rank-1');
        if (rank === 2) row.classList.add('rank-2');
        if (rank === 3) row.classList.add('rank-3');
        
        // Get score based on selected rock
        let score = 0;
        if (rockKey === 'totalScore') {
            score = user.totalScore;
        } else {
            score = user.rockScores[rockKey] || 0;
        }
        
        // Calculate account age
        const joinDate = new Date(user.accountCreated);
        const now = new Date();
        const daysSinceJoin = Math.floor((now - joinDate) / (1000 * 60 * 60 * 24));
        
        row.innerHTML = `
            <td class="rank-cell">${rank}</td>
            <td>
                <div class="explorer-cell">
                    <div class="explorer-avatar">${user.displayName.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="explorer-name">${user.displayName}</div>
                        <div class="explorer-email">${user.email}</div>
                    </div>
                </div>
            </td>
            <td class="score-cell">${score.toFixed(1)}</td>
            <td>
                <div class="samples-cell">
                    <span class="sample-tag">${user.totalSamples} collected</span>
                </div>
            </td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

// Update last updated time
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    lastUpdatedTime.textContent = timeString;
}

// Show leaderboard content
function showLeaderboard() {
    loadingElement.style.display = 'none';
    noDataElement.style.display = 'none';
    leaderboardContent.style.display = 'block';
}

// Show no data message
function showNoData() {
    loadingElement.style.display = 'none';
    leaderboardContent.style.display = 'none';
    noDataElement.style.display = 'block';
}

// Show error message
function showErrorMessage(message) {
    loadingElement.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
            <p style="font-size: 1.2rem;">⚠️ ${message}</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">Please check your connection and try again.</p>
        </div>
    `;
}

// Event Listeners
rockTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        applyRockFilter(tab.dataset.rock);
    });
});

refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<span class="refresh-icon">⟳</span> Refreshing...';
    
    await loadLeaderboardData();
    updateLastUpdatedTime();
    
    setTimeout(() => {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span class="refresh-icon">⟳</span> Refresh Leaderboard';
    }, 1000);
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initLeaderboard);