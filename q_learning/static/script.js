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

window.onload = updateBotPerformance;