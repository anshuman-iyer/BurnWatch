// --- 1. WELCOME SCREEN LOGIC ---
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

getStartedBtn.addEventListener('click', function() {
    let name = userNameInput.value.trim();
    if (name === "") name = "User";

    // Populate the Dashboard and Profile
    dashName.innerText = name;
    profileNameDisplay.innerText = name;
    profileSexDisplay.innerText = userSexInput.value;
    profileRoleDisplay.innerText = userRoleInput.value;
    profilePersonalityDisplay.innerText = userPersonalityInput.value;

    // Hide Welcome, Show Baseline Modal
    welcomeScreen.style.display = 'none';
    baselineModal.style.display = 'flex';
});

// --- NAVIGATION LOGIC ---
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

// --- 3. BASELINE (OLBI) LOGIC ---
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
const questionsContainer = document.getElementById('olbi-questions-container');

olbiQuestions.forEach((q, index) => {
    const div = document.createElement('div');
    div.className = 'olbi-question';
    div.innerHTML = `
        <p>${q.id}. ${q.text}</p>
        <input type="range" id="olbi-slider-${index}" min="1" max="4" value="2" style="width: 100%;">
        <div class="slider-labels">
            <span>Strongly Disagree</span><span>Disagree</span><span>Agree</span><span>Strongly Agree</span>
        </div>
    `;
    questionsContainer.appendChild(div);
});

document.getElementById('submit-baseline-btn').addEventListener('click', function() {
    alert("Baseline Saved! Taking you to the Dashboard.");
    baselineModal.style.display = 'none';
});

// --- 4. DAILY LOG WIZARD & BURNSCORE ENGINE ---

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
    
    // Applying the normalization math
    score += (stress * 2.5);                     // High stress spikes score
    score += ((screenTime - 4) * 1.5);           // 4 hours is neutral
    score += ((8 - sleep) * 3);                  // 8 hours is neutral, sleep debt hurts
    score -= (steps / 1000);                     // -1 point per 1000 steps (activity heals)
    score += ((hr - 65) * 0.3);                  // Elevated resting HR adds slight strain
    score -= (social * 1.5);                     // Socializing reduces burnout
    score += totalTagWeight;                     // Add the contextual stress load

    // 4. Bound the score between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

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
