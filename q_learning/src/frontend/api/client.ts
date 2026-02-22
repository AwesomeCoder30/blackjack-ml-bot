import type {
  PlayResponse,
  TrainResponse,
  SimulateResponse,
  EvaluateResponse,
  AboutResponse,
  TrainingProgressPoint,
} from "../../shared/api-types.js";

const base = "";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function getAbout(): Promise<AboutResponse> {
  return json(await fetch(`${base}/about`));
}

export async function postPlay(playerHand: string[], dealerCard: string): Promise<PlayResponse> {
  return json(
    await fetch(`${base}/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_hand: playerHand, dealer_card: dealerCard }),
    })
  );
}

export async function postTrain(episodes: number): Promise<TrainResponse> {
  return json(
    await fetch(`${base}/train`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodes }),
    })
  );
}

export async function getEvaluate(): Promise<EvaluateResponse> {
  return json(await fetch(`${base}/evaluate`));
}

export async function postSimulate(): Promise<SimulateResponse> {
  return json(
    await fetch(`${base}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
  );
}

export async function getTrainingProgress(n?: number): Promise<TrainingProgressPoint[]> {
  const url = n != null ? `${base}/training_progress?n=${n}` : `${base}/training_progress`;
  const data = await json<{ points: TrainingProgressPoint[] }>(await fetch(url));
  return data.points;
}

export async function postSaveModel(name: string): Promise<{ message: string }> {
  return json(
    await fetch(`${base}/save_model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
}

export async function postLoadModel(name: string): Promise<{ message: string }> {
  return json(
    await fetch(`${base}/load_model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
}

export async function getListModels(): Promise<{ models: string[] }> {
  return json(await fetch(`${base}/list_models`));
}
