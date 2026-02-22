import { Router } from "express";
import { createPlayRoutes } from "./play.routes.js";
import { createTrainRoutes } from "./train.routes.js";
import { createSimulateRoutes } from "./simulate.routes.js";
import { createModelsRoutes } from "./models.routes.js";
import { createAboutRoutes } from "./about.routes.js";
import { createTrainingProgressRoutes } from "./training-progress.routes.js";
import type { BotService } from "../services/bot-service.js";
import type { TrainingResultsService } from "../services/training-results.service.js";

export function mountRoutes(
  botService: BotService,
  trainingService: TrainingResultsService
): Router {
  const router = Router();
  router.use(createPlayRoutes(botService));
  router.use(createTrainRoutes(botService));
  router.use(createSimulateRoutes(botService));
  router.use(createModelsRoutes(botService));
  router.use(createAboutRoutes());
  router.use(createTrainingProgressRoutes(trainingService));
  return router;
}
