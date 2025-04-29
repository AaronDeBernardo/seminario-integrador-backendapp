import { authMiddlewares } from "../auth/auth.middlewares.js";
import { controller } from "./informe.controller.js";
import { Router } from "express";

export const informeRouter = Router();

informeRouter.post(
  "/caso",
  authMiddlewares.verifyAdminOrCliente,
  controller.sendCaseReport
);

informeRouter.post(
  "/desempenio",
  authMiddlewares.verifyAdmin,
  controller.sendPerformanceReport
);

informeRouter.post(
  "/ingresos",
  authMiddlewares.verifyAdmin,
  controller.sendIncomeReport
);
