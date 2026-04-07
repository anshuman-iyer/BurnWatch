/// --- 0. AUTHENTICATION GATEKEEPER & INITIALIZATION ---
const activeSession = localStorage.getItem('burnWatch_ActiveSession');

// If no one is logged in, kick them to login page
if (!activeSession) {
    window.location.href = 'login.html';
}

// 1. Fetch the entire JSON database
let usersDb = JSON.parse(localStorage.getItem('burnWatch_Users')) || [];

// 2. Find the specific profile for the person currently logged in
let currentUser = usersDb.find(user => user.username === activeSession);

// Grab Welcome & Modal Elements
const welcomeScreen = document.getElementById('welcome-screen');
const getStartedBtn = document.getElementById('get-started-btn');
const baselineModal = document.getElementById('baseline-modal');

// Input Elements
const userNameInput = document.getElementById('user-name');
const userSexInput = document.getElementById('user-sex');
const userRoleInput = document.getElementById('user-role');
const userPersonalityInput = document.getElementById('personality-slider');

// Display Elements
const dashName = document.getElementById('dash-name');
const profileNameDisplay = document.getElementById('profile-name-display');
const profileSexDisplay = document.getElementById('profile-sex-display');
const profileRoleDisplay = document.getElementById('profile-role-display');
const profilePersonalityDisplay = document.getElementById('profile-personality-display');

function updateDashboardCards() {
    const baselineCardDesc = document.querySelector('.card-baseline p');
    
    if (currentUser && currentUser.baselineScore) {
        baselineCardDesc.innerHTML = `Your stored baseline is <strong style="color: #4CAF50;">${currentUser.baselineScore} / 64</strong>.`;
    }
}
// Function to inject user data into the HTML dashboard
function populateDashboard(userObj) {

    let displayString = userObj.name || userObj.username; 
    dashName.innerText = displayString;
    profileNameDisplay.innerText = displayString;
    profileSexDisplay.innerText = userObj.sex || "--";
    profileRoleDisplay.innerText = userObj.role || "--";
    profilePersonalityDisplay.innerText = userObj.personality || "--";

    updateDashboardCards();

    if(shouldShowDailyPredictionFeedback()){
        showPredictionFeedbackCard();
    }
}

// --- 1. ONBOARDING ROUTING LOGIC ---

// When the page loads, check if this user has already finished the Welcome screen
if (currentUser && currentUser.onboardingComplete === true) {
    // Returning User: Hide the welcome screen immediately
    welcomeScreen.style.display = 'none';
    
    // Fill the dashboard with their saved JSON data
    populateDashboard(currentUser);
} 
// If they haven't finished onboarding, the Welcome screen stays visible by default!

// When a NEW user clicks "Get Started"
getStartedBtn.addEventListener('click', function() {
    let name = userNameInput.value.trim();
    if (name === "") name = "User";

    // 1. Update the currentUser object with the new data
    currentUser.name = name;
    currentUser.sex = userSexInput.value;
    currentUser.role = userRoleInput.value;
    currentUser.personality = userPersonalityInput.value;
    currentUser.onboardingComplete = true; // Mark as finished!

    // 2. Save the updated database back to Local Storage
    localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));

    // 3. Populate the Dashboard UI with this fresh data
    populateDashboard(currentUser);

    // 4. Hide Welcome, Show Baseline Modal
    welcomeScreen.style.display = 'none';
    baselineModal.style.display = 'flex';
});



// --- NAVIGATION LOGIC ---
// Sidebar Collapse Logic
const sidebar = document.getElementById('app-sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');

toggleSidebarBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
});
function logoutUser() {
    // Delete the active session token
    localStorage.removeItem('burnWatch_ActiveSession');
    // Send them back to the login page
    window.location.href = 'login.html';
}
function switchView(viewId) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(view => {
        view.style.display = 'none';
    });
    
    // Remove 'active' highlight from all sidebar buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show the section the user clicked
    document.getElementById(viewId).style.display = 'block';
    
    // Highlight the sidebar button if it was clicked
    if (event && event.currentTarget.classList) {
        if (event.currentTarget.classList.contains('nav-btn')) {
            event.currentTarget.classList.add('active');
        }
    }

    // NEW: If they are opening the Daily Log, wipe it clean first
    if (viewId === 'daily-log-view') {
        resetDailyLog();
    }
}

// --- 3. BASELINE (OLBI) ASSESSMENT LOGIC ---
const olbiQuestions = [
    { id: 1, text: "I always find new and interesting aspects in my work.", reverse: true },
    { id: 2, text: "There are days when I feel tired before I arrive at work.", reverse: false },
    { id: 3, text: "It happens more and more often that I talk about my work in a negative way.", reverse: false },
    { id: 4, text: "After work, I tend to need more time than in the past in order to relax and feel better.", reverse: false },
    { id: 5, text: "I can tolerate the pressure of my work very well.", reverse: true },
    { id: 6, text: "Lately, I tend to think less at work and do my job mechanically.", reverse: false },
    { id: 7, text: "I find my work to be a positive challenge.", reverse: true },
    { id: 8, text: "During my work, I often feel emotionally drained.", reverse: false },
    { id: 9, text: "Over time, one can become disconnected from this type of work.", reverse: false },
    { id: 10, text: "After working, I have enough energy for my leisure activities.", reverse: true },
    { id: 11, text: "Sometimes I feel sickened by my work tasks.", reverse: false },
    { id: 12, text: "After my work, I usually feel worn out and weary.", reverse: false },
    { id: 13, text: "This is the only type of work that I can imagine myself doing.", reverse: true },
    { id: 14, text: "Usually, I can manage the amount of my work well.", reverse: true },
    { id: 15, text: "I feel more and more engaged in my work.", reverse: true },
    { id: 16, text: "When I work, I usually feel energized.", reverse: true }
];
const olbiContainer = document.getElementById('olbi-questions-container');
const submitBaselineBtn = document.getElementById('submit-baseline-btn');

// 1. Generate questions using dropdowns (Standard OLBI scoring)
function renderOLBIQuestions() {
    if (!olbiContainer) return;
    olbiContainer.innerHTML = ''; 
    
    olbiQuestions.forEach((q, index) => {
        olbiContainer.innerHTML += `
            <div class="question-block" style="margin-bottom: 20px; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #e0e0e0;"><strong>${index + 1}.</strong> ${q.text}</p>
                <select id="olbi-q${q.id}" class="olbi-select" style="width: 100%; padding: 10px; border-radius: 6px; background: rgba(0,0,0,0.4); color: white; border: 1px solid rgba(76, 175, 80, 0.3); outline: none;">
                    <option value="1">Strongly Disagree</option>
                    <option value="2">Disagree</option>
                    <option value="3">Agree</option>
                    <option value="4">Strongly Agree</option>
                </select>
            </div>
        `;
    });
}

// 2. The Math Engine (Handles reverse scoring: 1 becomes 4, 4 becomes 1)
submitBaselineBtn.addEventListener('click', function() {
    // If the button says "Return", it just closes the modal
    if (submitBaselineBtn.innerText === "Return to Dashboard") {
        document.getElementById('baseline-modal').style.display = 'none';
        return;
    }

    let totalScore = 0;
    olbiQuestions.forEach(q => {
        let dropdown = document.getElementById(`olbi-q${q.id}`);
        if (dropdown) {
            let val = parseInt(dropdown.value);
            // Reverse score logic: (5 - 1 = 4), (5 - 4 = 1)
            totalScore += q.reverse ? (5 - val) : val;
        }
    });

    // Determine Risk Level
    let color = totalScore < 35 ? "#4CAF50" : (totalScore <= 44 ? "#FFC107" : "#F44336");
    let msg = totalScore < 35 ? "Low Risk" : (totalScore <= 44 ? "Moderate Risk" : "High Risk");

    // Save to the JSON database we built
    currentUser.baselineScore = totalScore;
    localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));

    // Show Results in the Modal
    olbiContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h1 style="font-size: 70px; color: ${color};">${totalScore}</h1>
            <p style="color: ${color}; font-weight: bold;">${msg}</p>
        </div>
    `;

    submitBaselineBtn.innerText = "Return to Dashboard";
    updateDashboardCards(); // Refresh the card on the dashboard
});

// Run the render function
renderOLBIQuestions();


// --- 4. DAILY LOG WIZARD & BURNSCORE ENGINE ---
// --- 0. AUTHENTICATION GATEKEEPER ---
// If there is no active session, kick them back to the login screen
if (!localStorage.getItem('burnWatch_ActiveSession')) {
    window.location.href = 'login.html';
}

// Check if they already did the Welcome Onboarding
if (localStorage.getItem('burnWatch_Role')) {
    // Hide the welcome screen if they already filled it out in a previous session
    document.getElementById('welcome-screen').style.display = 'none';
}
// Define the stress tags and their algorithmic weights
const stressReasons = [
    { id: 'work_deadlines', label: 'Work Deadlines', weight: 4.5 },
    { id: 'exam_prep', label: 'Exam Prep', weight: 4.5 },
    { id: 'health_issues', label: 'Health Issues', weight: 4.0 },
    { id: 'fin_stress', label: 'Financial Stress', weight: 4.0 },
    { id: 'social_conflict', label: 'Social Conflict', weight: 3.5 },
    { id: 'loneliness', label: 'Loneliness', weight: 3.5 },
    { id: 'sleep_debt', label: 'Sleep Debt', weight: 3.5 },
    { id: 'burnout_fear', label: 'Fear of Burnout', weight: 3.0 },
    { id: 'poor_diet', label: 'Poor Diet', weight: 2.5 },
    { id: 'commuting', label: 'Commuting', weight: 2.0 },
    { id: 'tech_issues', label: 'Tech Issues', weight: 2.0 },
    { id: 'noisy_env', label: 'Noisy Environment', weight: 1.5 },
    { id: 'creative_block', label: 'Creative Block', weight: 1.5 },
    { id: 'bad_weather', label: 'Bad Weather', weight: 1.0 }
];

// Dynamically generate the tag chips in Step 4
const tagsContainer = document.getElementById('stress-tags');
stressReasons.forEach(tag => {
    const chip = document.createElement('div');
    chip.className = 'tag-chip';
    chip.innerText = tag.label;
    chip.dataset.weight = tag.weight;
    
    // Toggle active state on click
    chip.addEventListener('click', () => {
        chip.classList.toggle('active');
    });
    
    tagsContainer.appendChild(chip);
});

// Function to move between wizard steps
function nextStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.style.display = 'none';
    });
    // Show target step
    document.getElementById(`step-${stepNumber}`).style.display = 'block';
}
// Function to clear all inputs when the user opens the Daily Log
function resetDailyLog() {
    // 1. Clear text inputs
    document.getElementById('steps-input').value = '';
    document.getElementById('hr-input').value = '';

    // 2. Reset sliders to their middle/healthy baselines
    document.getElementById('sleep-slider').value = 7;
    document.getElementById('sleep-value').innerText = '7';

    document.getElementById('screen-slider').value = 5;
    document.getElementById('screen-value').innerText = '5';

    document.getElementById('stress-slider').value = 5;
    document.getElementById('stress-value').innerText = '5';

    document.getElementById('social-slider').value = 5;
    document.getElementById('social-value').innerText = '5';

    // 3. Unclick all active stress tags
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.classList.remove('active');
    });

    // 4. Force the wizard back to Step 1
    nextStep(1);
}
// The Core Math Engine
function submitDailyLog() {
    // 1. Gather Data (Provide safe defaults if user leaves it blank)
    let steps = parseInt(document.getElementById('steps-input').value) || 5000;
    let hr = parseInt(document.getElementById('hr-input').value) || 65;
    let sleep = parseInt(document.getElementById('sleep-slider').value);
    let screenTime = parseInt(document.getElementById('screen-slider').value);
    let stress = parseInt(document.getElementById('stress-slider').value);
    let social = parseInt(document.getElementById('social-slider').value);

    // 2. Calculate Active Tags Weight
    let totalTagWeight = 0;
    document.querySelectorAll('.tag-chip.active').forEach(activeChip => {
        totalTagWeight += parseFloat(activeChip.dataset.weight);
    });

    // 3. The Algorithm
    let score = 30; // Base baseline
    
    score += (stress * 2.5);                     
    score += ((screenTime - 4) * 1.5);           
    score += ((8 - sleep) * 3);                  
    score -= (steps / 1000);                     
    score += ((hr - 65) * 0.3);                  
    score -= (social * 1.5);                     
    score += totalTagWeight; 
    
    

    // 4. Bound the score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // --- UPDATED: SAVE TO JSON HISTORY (Testing Mode: Auto-Advance Days) ---
    if (!currentUser.history) {
        currentUser.history = [];
    }

    let logDate;

    if (currentUser.history.length === 0) {
        logDate = new Date().toISOString().split('T')[0];
    } else {
        const lastLog = currentUser.history[currentUser.history.length - 1];
        const lastDateObj = new Date(lastLog.date);
        lastDateObj.setDate(lastDateObj.getDate() + 1);
        logDate = lastDateObj.toISOString().split('T')[0];
    }

    currentUser.history.push({ date: logDate, score: score });

    if (currentUser.history.length > 7) {
        currentUser.history.shift(); 
    }

    const userIndex = usersDb.findIndex(u => u.username === activeSession);
    usersDb[userIndex] = currentUser;
    localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));
    // -----------------------------------------------------------------------

    // 5. Update UI
    const scoreDisplay = document.getElementById('current-burn-score');
    const riskDisplay = document.getElementById('risk-level');
    
    scoreDisplay.innerText = score;

    if (score <= 40) { 
        scoreDisplay.style.color = "#4CAF50"; 
        riskDisplay.innerText = "Risk: LOW (Optimal)"; 
    }
    else if (score <= 70) { 
        scoreDisplay.style.color = "#FFC107"; 
        riskDisplay.innerText = "Risk: MODERATE (Monitor)"; 
    }
    else { 
        scoreDisplay.style.color = "#F44336"; 
        riskDisplay.innerText = "Risk: HIGH (Intervention Needed)"; 
    }

    // 6. Move to the final results step
    nextStep(5);
}

function shouldShowDailyPredictionFeedback(){

    if(!currentUser || !currentUser.history) return false;

    if(currentUser.history.length < 3) return false;

    const lastLog = currentUser.history[currentUser.history.length - 1];
    const todayKey = lastLog.date;

    if(!currentUser.lastPredictionFeedbackShown){
        currentUser.lastPredictionFeedbackShown = todayKey;
        localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));
        return true;
    }

    if(currentUser.lastPredictionFeedbackShown !== todayKey){
        currentUser.lastPredictionFeedbackShown = todayKey;
        localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));
        return true;
    }

    return false;
}

function showPredictionFeedbackCard(){

    const card = document.getElementById("prediction-feedback-card");
    if(!card) return;

    card.style.display = "block";
}

function hidePredictionFeedbackCard(){

    const card = document.getElementById("prediction-feedback-card");
    if(!card) return;

    card.style.display = "none";
}

function submitPredictionDashboardFeedback(isAccurate){

    if(!currentUser.predictionFeedback){
        currentUser.predictionFeedback = [];
    }

    currentUser.predictionFeedback.push({
        accurate:isAccurate,
        date:new Date().toISOString()
    });

    const userIndex = usersDb.findIndex(u => u.username === activeSession);
    usersDb[userIndex] = currentUser;

    localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));

    hidePredictionFeedbackCard();
}