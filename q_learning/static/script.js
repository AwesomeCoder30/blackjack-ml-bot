// --- ABOUT/MOTIVATION FETCH & DISPLAY ---
async function loadAbout() {
    try {
        const res = await fetch('/about');
        const data = await res.json();
        // Hero section
        document.getElementById('project-subtitle').textContent = data.title;
        document.getElementById('project-description').textContent = data.description;
        // About modal
        document.getElementById('modal-about-description').textContent = data.description;
        document.getElementById('modal-about-motivation').textContent = data.motivation;
        const featuresList = document.getElementById('modal-about-features');
        featuresList.innerHTML = '';
        data.features.forEach(f => {
            const li = document.createElement('li');
            li.textContent = f;
            featuresList.appendChild(li);
        });
    } catch (e) {
        // fallback
        document.getElementById('project-description').textContent = 'A Q-learning Blackjack bot.';
    }
}

// --- PLAY TAB ---
function getRandomCard() {
    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    return cards[Math.floor(Math.random() * cards.length)];
}

function randomizePlayerHand() {
    document.getElementById('playerHand').value = `${getRandomCard()},${getRandomCard()}`;
}

function randomizeDealerCard() {
    document.getElementById('dealerCard').value = getRandomCard();
}
async function getBotAction() {
    let playerHand = document.getElementById("playerHand").value.trim();
    let dealerCard = document.getElementById("dealerCard").value.trim();
    if (!playerHand || !dealerCard) {
        alert("Please enter both Player Hand and Dealer Card.");
        return;
    }
    const botAction = document.getElementById("botAction");
    botAction.textContent = "Thinking...";
    botAction.className = "display-4 text-info mb-3";
    try {
        let response = await fetch("/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player_hand: playerHand.split(","), dealer_card: dealerCard })
        });
        let data = await response.json();
        botAction.textContent = data.action || "Error";
        botAction.className = "display-4 text-warning mb-3";
        updateConfidenceMeter(data.confidence);
        document.getElementById('qvalue-explanation').textContent = `Q-value: ${data.confidence || 'N/A'} (higher = more confident)`;
    } catch (error) {
        botAction.textContent = "Error";
        botAction.className = "display-4 text-danger mb-3";
    }
}

function updateConfidenceMeter(confidence) {
    const meter = document.querySelector('.progress-bar');
    if (!meter) return;
    if (typeof confidence !== 'number' || isNaN(confidence)) confidence = 50;
    meter.style.width = `${confidence}%`;
    meter.classList.add('animated');
    if (confidence >= 80) {
        meter.className = 'progress-bar bg-success animated';
    } else if (confidence >= 50) {
        meter.className = 'progress-bar bg-warning animated';
    } else {
        meter.className = 'progress-bar bg-danger animated';
    }
}

// --- PERFORMANCE STATS ---
async function updateBotPerformance() {
    let response = await fetch("/evaluate", { method: "GET" });
    let data = await response.json();
    document.getElementById("wins").textContent = data.WIN || 0;
    document.getElementById("losses").textContent = data.LOSS || 0;
    document.getElementById("ties").textContent = data.TIE || 0;
}

// --- TRAIN TAB ---
document.getElementById("train-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const episodes = parseInt(document.getElementById('train-episodes').value) || 50000;
    const btn = document.getElementById('train-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Training...';
    document.getElementById('train-status').innerHTML = '';
    try {
        let response = await fetch("/train", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ episodes })
        });
        let data = await response.json();
        document.getElementById('train-status').innerHTML = `<span class='text-success'><i class='fas fa-check-circle me-2'></i>${data.message}</span>`;
        updateBotPerformance();
        updateTrainingChart();
    } catch (error) {
        document.getElementById('train-status').innerHTML = `<span class='text-danger'>Training failed.</span>`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-graduation-cap me-2"></i>Train';
    }
});

// --- TRAINING CHART (placeholder, can be improved with backend data) ---
let trainingChart;

function updateTrainingChart() {
    // For demo, generate random win rate data
    const ctx = document.getElementById('trainingChart').getContext('2d');
    const labels = Array.from({ length: 10 }, (_, i) => (i + 1) * 5000);
    const data = labels.map(() => Math.random() * 0.5 + 0.4);
    if (trainingChart) trainingChart.destroy();
    trainingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Win Rate',
                data,
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255,193,7,0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            scales: {
                y: { min: 0, max: 1, ticks: { callback: v => (v * 100).toFixed(0) + '%' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- SIMULATE TAB ---
document.getElementById("simulate-btn").addEventListener("click", async function() {
    const response = await fetch("/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    const logList = document.getElementById("log-list");
    logList.innerHTML = "";
    if (data.log) {
        data.log.forEach((entry, index) => {
            setTimeout(() => {
                const item = document.createElement("div");
                item.className = "alert alert-secondary mb-2 p-2";
                item.innerHTML = `<strong>Step ${index + 1}</strong>: Player Hand: <span class='text-warning'>${entry.player_hand.join(", ")}</span>, Dealer Card: <span class='text-info'>${entry.dealer_card}</span>, Action: <span class='fw-bold text-success'>${entry.action || "Pending"}</span>`;
                logList.appendChild(item);
                item.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, index * 400);
        });
        setTimeout(() => {
            document.getElementById("player-score").textContent = data.player_score;
            document.getElementById("dealer-score").textContent = data.dealer_score;
            const outcomeSpan = document.getElementById("game-outcome");
            outcomeSpan.textContent = data.outcome;
            outcomeSpan.className = "fw-bold";
            if (data.outcome === "WIN") outcomeSpan.classList.add("text-success");
            else if (data.outcome === "LOSS") outcomeSpan.classList.add("text-danger");
            else outcomeSpan.classList.add("text-info");
            document.getElementById("simulation-log").style.display = "block";
            document.getElementById("simulate-explanation").textContent = `The bot made its decisions based on its Q-table (learned strategy). Each step shows the hand, dealer card, and chosen action.`;
        }, data.log.length * 400);
    } else {
        alert("Simulation failed.");
    }
});

// --- MODELS TAB ---
async function saveModel() {
    const modelName = document.getElementById("modelNameInput").value.trim();
    if (!modelName) {
        alert("Please enter a model name.");
        return;
    }
    const response = await fetch("/save_model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: modelName })
    });
    const data = await response.json();
    alert(data.message || "Error saving model.");
    updateModelList();
}
async function loadModel() {
    const selectedModel = document.getElementById("modelSelect").value;
    if (!selectedModel) {
        alert("Please select a model to load.");
        return;
    }
    const response = await fetch("/load_model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedModel })
    });
    const data = await response.json();
    alert(data.message || "Error loading model.");
    updateBotPerformance();
}
async function updateModelList() {
    const response = await fetch("/list_models");
    const data = await response.json();
    const select = document.getElementById("modelSelect");
    select.innerHTML = "";
    if (!data.models || data.models.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No models to choose from";
        option.disabled = true;
        option.selected = true;
        option.style.fontStyle = "italic";
        option.style.color = "#888";
        select.appendChild(option);
        return;
    }
    data.models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model;
        select.appendChild(option);
    });
}

// --- INIT ---
window.onload = function() {
    loadAbout();
    updateBotPerformance();
    updateModelList();
    updateTrainingChart();
};