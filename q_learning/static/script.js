document.getElementById("blackjack-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    let playerHand = document.getElementById("player-hand-input").value.split(",");
    let dealerCard = document.getElementById("dealer-card-input").value.trim();

    let response = await fetch("/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_hand: playerHand, dealer_card: dealerCard })
    });

    let data = await response.json();

    document.getElementById("dealer-card").textContent = dealerCard;
    document.getElementById("player-hand").textContent = playerHand.join(", ");
    document.getElementById("bot-action").textContent = data.action;

    let historyList = document.getElementById("history");
    let historyEntry = document.createElement("li");
    historyEntry.textContent = `Player: ${playerHand.join(", ")} | Dealer: ${dealerCard} | AI Action: ${data.action}`;
    historyList.prepend(historyEntry);
});

// Training the bot from UI
document.getElementById("train-btn").addEventListener("click", async function() {
    let response = await fetch("/train", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ episodes: 50000 }) });
    let data = await response.json();
    alert(data.message);
});