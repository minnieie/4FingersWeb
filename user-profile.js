import { auth, watchAuthState, logoutUser } from './firebase-auth.js';
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

const db = getDatabase();

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

    // UPDATED: Logic to set the Welcome Name
    const email = data.profile?.email || "Explorer";
    const displayName = email.includes('@') ? email.split('@')[0] : email;
    document.getElementById('welcome-name').innerText = displayName;

    // UI mapping for other fields
    document.getElementById('display-email').innerText = data.profile?.email || "N/A";
    document.getElementById('display-created').innerText = data.profile?.accountCreated || "N/A";
    document.getElementById('display-login').innerText = data.profile?.lastLogin || "N/A";

    const samplesList = document.getElementById('display-samples');
    const samples = data.inventory?.samples || {};
    
    samplesList.innerHTML = ""; 
    for (const [name, amount] of Object.entries(samples)) {
        const li = document.createElement('li');
        li.innerText = `${name}: ${amount}`;
        samplesList.appendChild(li);
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    logoutUser().then(() => {
        window.location.href = "index.html";
    });
});