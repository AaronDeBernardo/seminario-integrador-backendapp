import { Router } from "express";
import { controller } from "./recordatorio.controller.js";

export const recordatorioRouter = Router();

recordatorioRouter.get("/", controller.findAll);
recordatorioRouter.get("/:id_caso", controller.sanitize, controller.findByCaso);
recordatorioRouter.post(
  "/:id_caso/:id_abogado",
  controller.sanitize,
  controller.add
);
recordatorioRouter.put("/:id", controller.sanitize, controller.update);
recordatorioRouter.delete("/:id", controller.sanitize, controller.delete);

export default recordatorioRouter;
