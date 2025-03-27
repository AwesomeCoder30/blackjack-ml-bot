async function getBotAction() {
    let playerHand = document.getElementById("playerHand").value.trim();
    let dealerCard = document.getElementById("dealerCard").value.trim();

    if (!playerHand || !dealerCard) {
        alert("Please enter both Player Hand and Dealer Card.");
        return;
    }

    let response = await fetch("/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_hand: playerHand.split(","), dealer_card: dealerCard })
    });

    let data = await response.json();
    document.getElementById("botAction").textContent = data.action || "Error";
}

async function updateBotPerformance() {
    let response = await fetch("/evaluate", { method: "GET" });
    let data = await response.json();

    document.getElementById("wins").textContent = data.WIN || 0;
    document.getElementById("losses").textContent = data.LOSS || 0;
    document.getElementById("ties").textContent = data.TIE || 0;
}

document.getElementById("train-btn").addEventListener("click", async function() {
    let response = await fetch("/train", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ episodes: 50000 }) });
    let data = await response.json();
    alert(data.message);
    updateBotPerformance();
});

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
            const item = document.createElement("li");
            item.className = "list-group-item bg-secondary text-light";
            item.innerHTML = `
                <strong>Step ${index + 1}</strong><br>
                Player Hand: ${entry.player_hand.join(", ")}<br>
                Dealer Card: ${entry.dealer_card}<br>
                Action: ${entry.action || "Pending"}
            `;
            logList.appendChild(item);
        });

        document.getElementById("player-score").textContent = data.player_score;
        document.getElementById("dealer-score").textContent = data.dealer_score;

        const outcomeSpan = document.getElementById("game-outcome");
        outcomeSpan.textContent = data.outcome;

        outcomeSpan.className = "fw-bold";
        if (data.outcome === "WIN") {
            outcomeSpan.classList.add("text-success");
        } else if (data.outcome === "LOSS") {
            outcomeSpan.classList.add("text-danger");
        } else {
            outcomeSpan.classList.add("text-info");
        }

        document.getElementById("simulation-log").style.display = "block";
    } else {
        alert("Simulation failed.");
    }
});


window.onload = updateBotPerformance;