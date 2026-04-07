const predictionText = document.getElementById("predictionText");

let burnData = [];
let labels = [];

const ctx = document.getElementById("chart");

const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: labels,
        datasets: [
        {
            label: "Burn Score",
            data: burnData,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.1)",
            tension:0.4,
            pointRadius:4,
            fill:false
        },
        {
            label: "Prediction",
            data: [],
            borderColor:"#a78bfa",
            borderDash:[6,6],
            tension:0.4,
            pointRadius:3
        }]
    },
    options:{
        plugins:{
            legend:{ labels:{ color:"#cbd5e1" } }
        },
        scales:{
            x:{
                ticks:{ color:"#94a3b8" },
                grid:{ color:"rgba(148,163,184,0.1)" }
            },
            y:{
                min:0,
                max:100,
                ticks:{ color:"#94a3b8" },
                grid:{ color:"rgba(148,163,184,0.1)" }
            }
        }
    }
});

function updatePrediction() {

    if(burnData.length < 3) {
        predictionText.innerText = "Insufficient data to predict";
        chart.data.datasets[1].data = [];
        hideFeedback();
        return;
    }

    const predictions = [...burnData];
    let last = burnData[burnData.length-1];

    let slope = calculateSlope(burnData);
    slope = applyFeedbackAdjustment(slope);

    for(let i=0;i<3;i++){
        last = Math.max(0, Math.min(100, last + slope));
        predictions.push(Math.round(last));
    }

    chart.data.datasets[1].data = predictions;

    while(chart.data.labels.length < predictions.length){
        chart.data.labels.push("Future");
    }

    const latestDate = labels[labels.length-1];

    if(!shouldShowPrediction(latestDate)){
        hideFeedback();
        return;
    }

    const yesterdayPrediction = Math.round(burnData[burnData.length-1] - slope);
    const mood = getMoodLabel(yesterdayPrediction);

    predictionText.innerText =
        "We predicted that you were feeling " + mood + " yesterday";

    showFeedback();
}

function calculateSlope(data){
    let n = data.length;
    let xSum=0,ySum=0,xy=0,x2=0;

    for(let i=0;i<n;i++){
        xSum+=i;
        ySum+=data[i];
        xy+=i*data[i];
        x2+=i*i;
    }

    return (n*xy - xSum*ySum) / (n*x2 - xSum*xSum);
}

function getMoodLabel(score){
    if(score <= 40) return "low stress";
    if(score <= 70) return "moderate stress";
    return "high stress";
}

function showFeedback(){
    let box = document.getElementById("predictionFeedback");
    if(box) box.style.display = "block";
}

function hideFeedback(){
    let box = document.getElementById("predictionFeedback");
    if(box) box.style.display = "none";
}

function submitPredictionFeedback(isAccurate){

    const activeSession = localStorage.getItem('burnWatch_ActiveSession');
    let usersDb = JSON.parse(localStorage.getItem('burnWatch_Users')) || [];
    let userIndex = usersDb.findIndex(u => u.username === activeSession);

    if(userIndex === -1) return;

    if(!usersDb[userIndex].predictionFeedback){
        usersDb[userIndex].predictionFeedback = [];
    }

    usersDb[userIndex].predictionFeedback.push({
        accurate:isAccurate
    });

    localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));

    hideFeedback();
}

function applyFeedbackAdjustment(slope){

    const activeSession = localStorage.getItem('burnWatch_ActiveSession');
    let usersDb = JSON.parse(localStorage.getItem('burnWatch_Users')) || [];
    let user = usersDb.find(u => u.username === activeSession);

    if(!user || !user.predictionFeedback) return slope;

    let score = 0;

    user.predictionFeedback.forEach(f=>{
        score += f.accurate ? 1 : -1;
    });

    const adjustment = score / user.predictionFeedback.length;

    return slope * (1 + (adjustment * 0.15));
}

function shouldShowPrediction(logDate){

    const activeSession = localStorage.getItem('burnWatch_ActiveSession');
    let usersDb = JSON.parse(localStorage.getItem('burnWatch_Users')) || [];
    let user = usersDb.find(u => u.username === activeSession);

    if(!user) return false;

    if(!user.lastPredictionShown){
        user.lastPredictionShown = logDate;
        localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));
        return true;
    }

    if(user.lastPredictionShown !== logDate){
        user.lastPredictionShown = logDate;
        localStorage.setItem('burnWatch_Users', JSON.stringify(usersDb));
        return true;
    }

    return false;
}

/* --- LOCAL JSON DATABASE LISTENER --- */
function loadLocalData() {

    const activeSession = localStorage.getItem('burnWatch_ActiveSession');
    if (!activeSession) {
        predictionText.innerText = "Please log in to view data.";
        return;
    }

    const usersDb = JSON.parse(localStorage.getItem('burnWatch_Users')) || [];
    const currentUser = usersDb.find(u => u.username === activeSession);

    if (!currentUser || !currentUser.history || currentUser.history.length === 0) {
        predictionText.innerText = "No daily logs found. Start logging!";
        chart.update();
        return;
    }

    burnData.length = 0;
    labels.length = 0;

    currentUser.history.forEach(log => {
        burnData.push(log.score);

        const dateParts = log.date.split('-'); 
        labels.push(`${dateParts[1]}/${dateParts[2]}`);
    });

    updatePrediction();
    chart.update();
}

loadLocalData();