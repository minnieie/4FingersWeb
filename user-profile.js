import { auth, watchAuthState, logoutUser, db } from './firebase-auth.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

// Image mapping for samples
const sampleImages = {
    'basalt': 'images/basalt.png',
    'carbonateRock': 'images/carbonateRock.png',
    'gypsum': 'images/gypsum.png',
    'regolith': 'images/regolith.png',
    'smeciteClay': 'images/smeciteClay.png',
    'water': 'images/water.png',
    
    // Tool images (you can add these later)
    'extractor': 'images/extractor.png',
    'Sample Container': 'images/default-tool.png',
    'Laser Spectrometer': 'images/default-tool.png',
};

// Helper function to format names
function formatName(name) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

watchAuthState(async (user) => {
    if (user) {
        console.log("User is logged in:", user.uid);
        await loadUserProfile(user.uid);
    } else {
        // No user is signed in, redirect to login
        window.location.href = "index.html"; 
    }
});

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
            day: 'numeric'
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

    // Display inventory samples and tools
    const samplesList = document.getElementById('display-samples');
    samplesList.innerHTML = ""; 
    
    // First, show TOOLS section (from Unity structure)
    const tools = data.inventory?.tools || {};
    if (Object.keys(tools).length > 0) {
        const toolsHeader = document.createElement('h4');
        toolsHeader.innerText = "Tools";
        toolsHeader.style.marginTop = "30px";
        toolsHeader.style.marginBottom = "15px";
        toolsHeader.style.color = "#ef8d6e";
        toolsHeader.style.fontFamily = "'Cinzel', serif";
        samplesList.appendChild(toolsHeader);
        
        for (const [name, owned] of Object.entries(tools)) {
            const li = document.createElement('li');
            
            // Get image for tool or use default
            const imageSrc = sampleImages[name] || 'images/default-tool.png';
            const formattedName = formatName(name);
            
            li.innerHTML = `
                <div class="sample-item">
                    <img src="${imageSrc}" alt="${formattedName}" class="sample-image">
                    <div class="sample-info">
                        <h4>${formattedName}</h4>
                        <span class="sample-status ${owned ? 'owned' : 'not-owned'}">
                            ${owned ? "Owned" : "Not Owned"}
                        </span>
                    </div>
                </div>
            `;
            samplesList.appendChild(li);
        }
    }
    
    // Then, show SAMPLES section (from Unity structure)
    const samples = data.inventory?.samples || {};
    if (Object.keys(samples).length > 0) {
        const samplesHeader = document.createElement('h4');
        samplesHeader.innerText = "Mineral Samples";
        samplesHeader.style.marginTop = "30px";
        samplesHeader.style.marginBottom = "15px";
        samplesHeader.style.color = "#4CAF50";
        samplesHeader.style.fontFamily = "'Cinzel', serif";
        samplesList.appendChild(samplesHeader);
        
        for (const [name, amount] of Object.entries(samples)) {
            const li = document.createElement('li');
            
            // Get image for sample or use default
            const imageSrc = sampleImages[name] || 'images/default-sample.png';
            const formattedName = formatName(name);
            
            li.innerHTML = `
                <div class="sample-item">
                    <img src="${imageSrc}" alt="${formattedName}" class="sample-image">
                    <div class="sample-info">
                        <h4>${formattedName}</h4>
                        <span class="sample-amount">${amount}</span>
                        <div class="sample-progress">
                            <div class="progress-bar" style="width: ${Math.min(amount * 10, 100)}%"></div>
                        </div>
                    </div>
                </div>
            `;
            samplesList.appendChild(li);
        }
    }
    
    // If no inventory data
    if (Object.keys(tools).length === 0 && Object.keys(samples).length === 0) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="sample-item">
                <img src="images/default-sample.png" alt="No items" class="sample-image">
                <div class="sample-info">
                    <h4>No inventory items found</h4>
                    <span class="sample-status">Start collecting!</span>
                </div>
            </div>
        `;
        samplesList.appendChild(li);
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser().then(() => {
        window.location.href = "index.html";
    });
});