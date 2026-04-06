const input = document.getElementById("burnInput");
const btn = document.getElementById("addBtn");
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
            fill:true,
            tension:0.4,
            pointRadius:4
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
            legend:{
                labels:{ color:"#cbd5e1" }
            }
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

btn.addEventListener("click", addData);

function addData() {
    const value = parseInt(input.value);
    if(isNaN(value)) return;

    burnData.push(value);
    labels.push("Day " + burnData.length);

    updatePrediction();
    chart.update();
}

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