# Blackjack Q-Learning Bot

Q-learning Blackjack agent with a web UI. Train the bot, get actions for a hand, simulate full games, and save/load models.

## Stack

TypeScript (Node backend + Vite frontend), Express, Bootstrap, Chart.js.

## Setup

```bash
cd q_learning
npm install
```

Config and runtime data live under `data/`. Copy `data/config.json` from the repo; optional: copy an existing `q_table.json` into `data/` to start from a trained table.

## Run

```bash
npm run build
npm start
```

Then open http://localhost:5001 (or the port in `PORT`).

- **Dev:** `npm run dev` runs the backend with tsx watch. Build the frontend once with `npm run build:frontend` and serve it, or use a separate Vite dev server.
- **Env:** `PORT` (default 5001), `DATA_DIR` (default `./data`).

## Tests

```bash
npm test
```

Unit tests cover domain (hand, deck, game, Q-learning agent) and persistence. Integration tests hit the HTTP API.

## Architecture

- **Domain** (`src/domain`): Deck, hand value, one-round game, Q-learning agent, bot (orchestrates game + agent + stores).
- **Backend** (`src/backend`): Express app, routes (play, train, evaluate, simulate, models, about, training_progress), services, file-based persistence (Q-table, config, results CSV).
- **Frontend** (`src/frontend`): Single HTML entry, TypeScript entrypoint, API client, one CSS bundle. About content and training chart use the API.
- **Shared** (`src/shared`): Request/response and shared types.

## License

MIT.
