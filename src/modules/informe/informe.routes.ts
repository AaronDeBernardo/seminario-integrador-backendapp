import { controller } from "./informe.controller.js";
import { Router } from "express";

export const informeRouter = Router();

informeRouter.post("/caso", controller.sendCaseReport);
informeRouter.post("/desempenio", controller.sendPerformanceReport);
informeRouter.post("/ingresos", controller.sendIncomeReport);
