import * as api from "./api/client.js";

const CARDS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function getRandomCard(): string {
  return CARDS[Math.floor(Math.random() * CARDS.length)];
}

function byId(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

async function loadAbout(): Promise<void> {
  try {
    const data = await api.getAbout();
    byId("modal-about-description").textContent = data.description;
    byId("modal-about-motivation").textContent = data.motivation;
    const list = byId("modal-about-features");
    list.innerHTML = "";
    data.features.forEach((f) => {
      const li = document.createElement("li");
      li.textContent = f;
      list.appendChild(li);
    });
  } catch {
    byId("modal-about-description").textContent = "A Q-learning Blackjack bot.";
  }
}

async function updateBotPerformance(): Promise<void> {
  try {
    const data = await api.getEvaluate();
    byId("wins").textContent = formatNumber(data.WIN ?? 0);
    byId("losses").textContent = formatNumber(data.LOSS ?? 0);
    byId("ties").textContent = formatNumber(data.TIE ?? 0);
  } catch {
    // ignore
  }
}

declare global {
  interface Window {
    Chart: new (el: HTMLCanvasElement, config: unknown) => { destroy: () => void };
  }
}

let trainingChart: { destroy: () => void } | null = null;

async function updateTrainingChart(): Promise<void> {
  const canvas = document.getElementById("trainingChart") as HTMLCanvasElement | null;
  if (!canvas || typeof window.Chart === "undefined") return;
  try {
    const points = await api.getTrainingProgress(100);
    const labels = points.map((p) => p.episode);
    const data = points.map((p) => p.winRate);
    if (trainingChart) trainingChart.destroy();
    trainingChart = new window.Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Win Rate",
            data,
            borderColor: "#8b949e",
            backgroundColor: "rgba(139, 148, 158, 0.15)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#8b949e" } },
          y: {
            min: 0,
            max: 1,
            grid: { color: "rgba(255,255,255,0.06)" },
            ticks: { color: "#8b949e", callback: (v: number | string) => (Number(v) * 100).toFixed(0) + "%" },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  } catch {
    if (trainingChart) trainingChart.destroy();
    trainingChart = null;
  }
}

function updateConfidenceMeter(confidence: number): void {
  const meter = document.querySelector("#confidenceMeter .confidence-bar");
  if (!meter) return;
  const raw = typeof confidence === "number" && !Number.isNaN(confidence) ? confidence : 50;
  const pct = Math.min(100, Math.max(0, raw));
  (meter as HTMLElement).style.width = `${pct}%`;
}

function showDecisionStatus(text: string): void {
  const status = document.getElementById("decision-status");
  const result = document.getElementById("decision-result");
  if (status) {
    const textEl = status.querySelector("#decision-status-text");
    if (textEl) textEl.textContent = text;
    status.style.display = "flex";
  }
  if (result) result.style.display = "none";
}

function showDecisionResult(action: string, confidence: number, basicStrategy?: string): void {
  const status = document.getElementById("decision-status");
  const result = document.getElementById("decision-result");
  if (status) status.style.display = "none";
  if (result) {
    result.style.display = "grid";
    const actionEl = document.getElementById("botAction");
    if (actionEl) actionEl.textContent = action;
    updateConfidenceMeter(confidence);
    const valueEl = document.getElementById("confidenceValue");
    if (valueEl) valueEl.textContent = `${Math.min(100, Math.max(0, Number(confidence.toFixed(1))))}%`;
    const bsEl = document.getElementById("basicStrategyLine");
    if (bsEl) bsEl.textContent = basicStrategy ? `Basic strategy: ${basicStrategy}` : "";
  }
}

async function getBotAction(): Promise<void> {
  const playerHand = (byId("playerHand") as HTMLInputElement).value.trim();
  const dealerCard = (byId("dealerCard") as HTMLInputElement).value.trim();
  if (!playerHand || !dealerCard) {
    alert("Please enter both Player Hand and Dealer Card.");
    return;
  }
  showDecisionStatus("Thinking...");
  try {
    const hands = playerHand.split(",").map((c) => c.trim());
    const data = await api.postPlay(hands, dealerCard);
    showDecisionResult(data.action, data.confidence, data.basicStrategy);
  } catch {
    showDecisionStatus("Error getting recommendation.");
  }
}

async function updateModelList(): Promise<void> {
  try {
    const data = await api.getListModels();
    const select = byId("modelSelect") as HTMLSelectElement;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Load existing model...";
    select.appendChild(placeholder);
    if (data.models?.length) {
      data.models.forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
    }
  } catch {
    // ignore
  }
}

function randomizePlayerHand(): void {
  (byId("playerHand") as HTMLInputElement).value = `${getRandomCard()},${getRandomCard()}`;
}

function randomizeDealerCard(): void {
  (byId("dealerCard") as HTMLInputElement).value = getRandomCard();
}

async function saveModel(): Promise<void> {
  const name = (byId("modelNameInput") as HTMLInputElement).value.trim();
  if (!name) {
    alert("Please enter a model name.");
    return;
  }
  try {
    const data = await api.postSaveModel(name);
    alert(data.message);
    await updateModelList();
  } catch (e) {
    alert((e as Error).message ?? "Error saving model.");
  }
}

async function loadModel(): Promise<void> {
  const select = byId("modelSelect") as HTMLSelectElement;
  const name = select.value;
  if (!name) {
    alert("Please select a model to load.");
    return;
  }
  try {
    const data = await api.postLoadModel(name);
    alert(data.message);
    await updateBotPerformance();
  } catch (e) {
    alert((e as Error).message ?? "Error loading model.");
  }
}

function syncEpisodesFromSlider(): void {
  const slider = document.getElementById("train-episodes-slider") as HTMLInputElement;
  const number = document.getElementById("train-episodes") as HTMLInputElement;
  const display = document.getElementById("train-episodes-display");
  if (slider && number) {
    const val = Number(slider.value);
    number.value = String(val);
    if (display) display.textContent = formatNumber(val);
  }
}

function syncEpisodesFromNumber(): void {
  const slider = document.getElementById("train-episodes-slider") as HTMLInputElement;
  const number = document.getElementById("train-episodes") as HTMLInputElement;
  const display = document.getElementById("train-episodes-display");
  if (slider && number && display) {
    const val = Math.min(100000, Math.max(1000, Number(number.value) || 50000));
    number.value = String(val);
    slider.value = String(val);
    display.textContent = formatNumber(val);
  }
}

function init(): void {
  loadAbout();
  updateBotPerformance();
  updateModelList();
  updateTrainingChart();
  showDecisionStatus("Waiting for input parameters...");

  const slider = document.getElementById("train-episodes-slider");
  const numberInput = document.getElementById("train-episodes");
  if (slider) {
    slider.addEventListener("input", syncEpisodesFromSlider);
  }
  if (numberInput) {
    numberInput.addEventListener("change", syncEpisodesFromNumber);
  }
  syncEpisodesFromSlider();

  byId("randPlayer").addEventListener("click", randomizePlayerHand);
  byId("randDealer").addEventListener("click", randomizeDealerCard);
  byId("getBotAction").addEventListener("click", () => void getBotAction());

  byId("train-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    syncEpisodesFromNumber();
    const episodes = Number((byId("train-episodes") as HTMLInputElement).value) || 50000;
    const btn = byId("train-btn");
    btn.setAttribute("disabled", "true");
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Training...';
    byId("train-status").textContent = "Training...";
    try {
      const data = await api.postTrain(episodes);
      byId("train-status").textContent = data.message;
      await updateBotPerformance();
      await updateTrainingChart();
    } catch {
      byId("train-status").textContent = "Training failed.";
    } finally {
      btn.removeAttribute("disabled");
      btn.innerHTML = '<i class="fas fa-play me-2"></i>Start Training';
    }
  });

  byId("simulate-btn").addEventListener("click", async () => {
    try {
      const data = await api.postSimulate();
      const emptyEl = document.getElementById("simulation-empty");
      const logContainer = byId("simulation-log");
      if (emptyEl) emptyEl.style.display = "none";
      logContainer.style.display = "block";

      const logList = byId("log-list");
      logList.innerHTML = "";
      data.log.forEach((entry, index) => {
        const div = document.createElement("div");
        div.className = "log-item";
        const handStr = `[${entry.player_hand.join(",")}]`;
        const actionStr = entry.action ?? "—";
        div.innerHTML = `<span class="log-step-num">${index + 1}</span><span class="log-detail">Player ${handStr} vs Dealer [${entry.dealer_card}]</span><span class="log-action">${actionStr}</span>`;
        logList.appendChild(div);
      });
      byId("player-score").textContent = String(data.player_score);
      byId("dealer-score").textContent = String(data.dealer_score);
      const outcomeSpan = byId("game-outcome");
      outcomeSpan.textContent = data.outcome === "TIE" ? "Tie" : data.outcome.charAt(0) + data.outcome.slice(1).toLowerCase();
      outcomeSpan.className = "";
      if (data.outcome === "WIN") outcomeSpan.classList.add("text-success");
      else if (data.outcome === "LOSS") outcomeSpan.classList.add("text-danger");
      else outcomeSpan.classList.add("text-info");
    } catch {
      alert("Simulation failed.");
    }
  });

  byId("saveModelBtn").addEventListener("click", () => void saveModel());
  byId("loadModelBtn").addEventListener("click", () => void loadModel());
}

init();
