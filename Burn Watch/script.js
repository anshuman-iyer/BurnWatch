// 1. Grab the HTML elements so we can control them
const verificationModal = document.getElementById('verification-modal');
const confirmBtn = document.getElementById('confirm-btn');
const editBtn = document.getElementById('edit-btn');

// 2. Logic for the Verification Prompt
confirmBtn.addEventListener('click', function() {
    // When the user clicks confirm, show a success message
    alert("User Verified: Estimate Confirmed +0.1!");
    
    // Hide the popup modal
    verificationModal.style.display = 'none';
});

editBtn.addEventListener('click', function() {
    // If they want to edit, you would normally redirect them to the log screen
    alert("Opening manual log screen to adjust the 68 score...");
    verificationModal.style.display = 'none';
});

// 3. Logic for the Feedback Buttons
function submitFeedback(status) {
    if (status === 'helpful') {
        alert("Thanks! We'll prioritize this suggestion in the future.");
    } else {
        alert("Noted. We'll adjust your future recovery suggestions.");
    }
}
// 1. Grab all the slider elements
const moodSlider = document.getElementById('mood-slider');
const sleepSlider = document.getElementById('sleep-slider');
const stressSlider = document.getElementById('stress-slider');
const socialSlider = document.getElementById('social-slider');

// Grab the text elements that display the values
const moodValue = document.getElementById('mood-value');
const sleepValue = document.getElementById('sleep-value');
const stressValue = document.getElementById('stress-value');
const socialValue = document.getElementById('social-value');

// Grab the main Score and Risk displays
const scoreDisplay = document.getElementById('current-burn-score');
const riskDisplay = document.getElementById('risk-level');

// 2. Put all sliders into an array so we can easily loop through them
const allSliders = [moodSlider, sleepSlider, stressSlider, socialSlider];

// 3. The Core Calculation Function
function calculateBurnScore() {
    // Get the current numbers from the sliders and convert them to integers
    let mood = parseInt(moodSlider.value);
    let sleep = parseInt(sleepSlider.value);
    let stress = parseInt(stressSlider.value);
    let social = parseInt(socialSlider.value);

    // Update the small numbers next to the sliders
    moodValue.innerText = mood;
    sleepValue.innerText = sleep;
    stressValue.innerText = stress;
    socialValue.innerText = social;

    // A basic sample algorithm to calculate burnout (0-100)
    // High stress increases it. High sleep/mood/social decreases it.
    let score = 50; // Start at a baseline
    score += (stress * 4);         // Stress is bad
    score -= (mood * 3);           // Good mood is good
    score -= ((sleep - 6) * 3);    // Sleep over 6 hours helps
    score -= (social * 1.5);       // Socializing helps slightly

    // Make sure the score doesn't go below 0 or above 100
    if (score > 100) score = 100;
    if (score < 0) score = 0;
    
    // Round to a whole number
    score = Math.round(score);

    // Update the big number on the screen
    scoreDisplay.innerText = score;

    // Update the colors and risk text [cite: 110, 111, 112]
    if (score <= 40) {
        scoreDisplay.style.color = "#4CAF50"; // Green
        riskDisplay.innerText = "Risk: LOW";
    } else if (score <= 70) {
        scoreDisplay.style.color = "#FFC107"; // Yellow
        riskDisplay.innerText = "Risk: MODERATE";
    } else {
        scoreDisplay.style.color = "#F44336"; // Red
        riskDisplay.innerText = "Risk: HIGH";
    }
}

// 4. Attach an "event listener" to every slider. 
// Every time a user moves a slider ('input'), run the calculation function.
allSliders.forEach(slider => {
    slider.addEventListener('input', calculateBurnScore);
});

// Run it once when the page loads to set the initial values
calculateBurnScore();
// 1. The OLBI Data Structure
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

// 2. Grab the HTML elements
const questionsContainer = document.getElementById('olbi-questions-container');
const submitBaselineBtn = document.getElementById('submit-baseline-btn');
const baselineModal = document.getElementById('baseline-modal');

// 3. Dynamically Generate the UI Form
function renderOLBIForm() {
    olbiQuestions.forEach((q, index) => {
        // Create a div for each question
        const questionDiv = document.createElement('div');
        questionDiv.className = 'olbi-question';
        
        // Build the inner HTML for the slider
        // Values map to: 1=Strongly Disagree, 2=Disagree, 3=Agree, 4=Strongly Agree
        questionDiv.innerHTML = `
            <p>${q.id}. ${q.text}</p>
            <input type="range" id="olbi-slider-${index}" min="1" max="4" value="2" step="1" style="width: 100%;">
            <div class="slider-labels">
                <span>Strongly Disagree</span>
                <span>Disagree</span>
                <span>Agree</span>
                <span>Strongly Agree</span>
            </div>
        `;
        
        questionsContainer.appendChild(questionDiv);
    });
}

// 4. Calculate the Baseline Score
submitBaselineBtn.addEventListener('click', function() {
    let totalScore = 0;

    olbiQuestions.forEach((q, index) => {
        const slider = document.getElementById(`olbi-slider-${index}`);
        let rawValue = parseInt(slider.value);
        let finalScore = 0;

        // Apply reverse scoring math if needed
        if (q.reverse) {
            // If reverse: 1 becomes 4, 2 becomes 3, 3 becomes 2, 4 becomes 1
            finalScore = 5 - rawValue;
        } else {
            // Standard scoring stays the same
            finalScore = rawValue;
        }

        totalScore += finalScore;
    });

    alert("Baseline Submitted! Your OLBI raw score is: " + totalScore + " out of 64.");
    
    // Hide the baseline modal so the user can access the dashboard
    baselineModal.style.display = 'none';
});

// Run the generation function immediately
renderOLBIForm();