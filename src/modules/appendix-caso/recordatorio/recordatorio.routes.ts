import { controller } from "./recordatorio.controller.js";
import { Router } from "express";

export const recordatorioRouter = Router();

recordatorioRouter.get("/:id_caso", controller.findByCaso);
recordatorioRouter.get("/", controller.findAll);
recordatorioRouter.post("/", controller.sanitize, controller.add);
recordatorioRouter.put("/:id", controller.sanitize, controller.update);
recordatorioRouter.delete("/:id", controller.delete);
