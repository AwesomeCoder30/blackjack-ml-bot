from flask import Flask, render_template, request, jsonify # type: ignore
from blackjack_ml_bot import BlackjackBot
import requests # type: ignore

app = Flask(__name__)
bot = BlackjackBot()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/play", methods=["POST"])
def play():
    """Receives player's hand and dealer card, returns bot's action."""
    try:
        data = request.get_json()
        print("Received data:", data)
        if not data:
            return jsonify({"error": "Invalid or empty JSON payload"}), 400
        player_hand = data["player_hand"]
        dealer_card = data["dealer_card"]

        player_value, soft = bot.hand_value(player_hand)
        state = (player_value, bot.card_values[dealer_card], soft, len(player_hand), True)

        action = bot.choose_action(state)
        print("Bot action:", action)
        return jsonify({"action": action})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 400

@app.route("/train", methods=["POST"])
def train():
    """Trains the bot with specified episodes."""
    try:
        data = request.get_json()
        episodes = data.get("episodes", 50000)  # Default: 50,000 episodes
        bot.train(episodes)
        return jsonify({"message": f"Training completed for {episodes} episodes."})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/evaluate", methods=["GET"])
def evaluate():
    """Evaluates the bot's performance."""
    results = bot.evaluate(100)
    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True, port=5001)