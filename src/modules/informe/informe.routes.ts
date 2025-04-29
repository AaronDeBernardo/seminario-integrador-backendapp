import { authMiddlewares } from "../auth/auth.middlewares.js";
import { controller } from "./informe.controller.js";
import { Router } from "express";

export const informeRouter = Router();

informeRouter.post(
  "/caso",
  authMiddlewares.verifyAdmin,
  authMiddlewares.verifyUsuario,
  controller.sendCaseReport
);

informeRouter.post(
  "/desempenio",
  authMiddlewares.verifyAdmin,
  authMiddlewares.verifyUsuario,
  controller.sendPerformanceReport
);

informeRouter.post(
  "/ingresos",
  authMiddlewares.verifyAdmin,
  authMiddlewares.verifyUsuario,
  controller.sendIncomeReport
);
