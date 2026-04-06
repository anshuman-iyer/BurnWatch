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

// --- 2. NAVIGATION LOGIC ---
function switchView(viewId) {
    document.querySelectorAll('.view-section').forEach(view => {
        view.style.display = 'none';
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(viewId).style.display = 'block';
    event.currentTarget.classList.add('active');
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

// --- 4. DAILY LOG (BURN SCORE) LOGIC ---
const allSliders = ['mood', 'sleep', 'stress', 'social'].map(id => document.getElementById(`${id}-slider`));

function calculateBurnScore() {
    let mood = parseInt(document.getElementById('mood-slider').value);
    let sleep = parseInt(document.getElementById('sleep-slider').value);
    let stress = parseInt(document.getElementById('stress-slider').value);
    let social = parseInt(document.getElementById('social-slider').value);

    document.getElementById('mood-value').innerText = mood;
    document.getElementById('sleep-value').innerText = sleep;
    document.getElementById('stress-value').innerText = stress;
    document.getElementById('social-value').innerText = social;

    let score = 50 + (stress * 4) - (mood * 3) - ((sleep - 6) * 3) - (social * 1.5);
    score = Math.max(0, Math.min(100, Math.round(score)));

    const scoreDisplay = document.getElementById('current-burn-score');
    const riskDisplay = document.getElementById('risk-level');
    scoreDisplay.innerText = score;

    if (score <= 40) { scoreDisplay.style.color = "#4CAF50"; riskDisplay.innerText = "Risk: LOW"; }
    else if (score <= 70) { scoreDisplay.style.color = "#FFC107"; riskDisplay.innerText = "Risk: MODERATE"; }
    else { scoreDisplay.style.color = "#F44336"; riskDisplay.innerText = "Risk: HIGH"; }
}

allSliders.forEach(slider => slider.addEventListener('input', calculateBurnScore));
calculateBurnScore();
