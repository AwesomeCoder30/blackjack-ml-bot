document.getElementById("blackjack-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let playerHand = document.getElementById("player-hand").value.split(",");
    let dealerCard = document.getElementById("dealer-card").value.trim();

    fetch("/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ player_hand: playerHand, dealer_card: dealerCard })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById("bot-action").textContent = data.action || "Error";
        })
        .catch(error => console.error("Error:", error));
});