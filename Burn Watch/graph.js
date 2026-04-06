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
        return;
    }

    predictionText.innerText = "Prediction active";

    const predictions = [...burnData];
    let last = burnData[burnData.length-1];
    let slope = calculateSlope(burnData);

    for(let i=0;i<3;i++){
        last = Math.max(0, Math.min(100, last + slope));
        predictions.push(Math.round(last));
    }

    chart.data.datasets[1].data = predictions;

    while(chart.data.labels.length < predictions.length){
        chart.data.labels.push("Future");
    }
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

/* --- LOCAL JSON DATABASE LISTENER --- */
function loadLocalData() {
    // 1. Check who is logged in
    const activeSession = localStorage.getItem('burnWatch_ActiveSession');
    if (!activeSession) {
        predictionText.innerText = "Please log in to view data.";
        return;
    }

    // 2. Open the database and find the current user
    const usersDb = JSON.parse(localStorage.getItem('burnWatch_Users')) || [];
    const currentUser = usersDb.find(u => u.username === activeSession);

    // 3. Check if they have any logged data yet
    if (!currentUser || !currentUser.history || currentUser.history.length === 0) {
        predictionText.innerText = "No daily logs found. Start logging!";
        chart.update();
        return;
    }

    // 4. Clear the chart arrays
    burnData.length = 0;
    labels.length = 0;

    // 5. Loop through the user's history and push it to the chart
    currentUser.history.forEach(log => {
        burnData.push(log.score);
        
        // Convert "YYYY-MM-DD" into a friendly "Month/Day" label
        const dateParts = log.date.split('-'); 
        labels.push(`${dateParts[1]}/${dateParts[2]}`);
    });

    // 6. Run your existing prediction math and update the chart!
    updatePrediction();
    chart.update();
}

// Run the function immediately when the graph page loads
loadLocalData();