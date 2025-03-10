# Blackjack ML Bot

## Overview

The **Blackjack ML Bot** is a reinforcement learning-based Blackjack player that learns optimal strategies through Q-learning. It adjusts its actions dynamically based on experience and improves its decision-making over time.

## Features

- **Q-Learning AI**: Learns from previous games and updates its decision-making.
- **Dynamic Epsilon Decay**: Reduces exploration as training progresses.
- **Double Down Support**: Implements doubling down for improved strategy.
- **Graphical Training Analysis**: Plots win rate over training.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/blackjack-ml-bot.git
   cd blackjack-ml-bot
   ```
2. Install dependencies:
   ```bash
   pip install matplotlib
   ```
3. Run the bot:
   ```bash
   python blackjack_ml_bot.py
   ```

## Configuration

Modify `config.json` to customize training parameters.

## Usage

- Run `blackjack_ml_bot.py` to train and evaluate the bot.
- Modify `test_blackjack.py` to add test cases and verify bot behavior.

## Contributing

Feel free to submit pull requests or open issues.

## License

MIT License.

