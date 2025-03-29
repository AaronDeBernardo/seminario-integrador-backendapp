import { controller } from "./caso.controller.js";
import { Router } from "express";

export const casoRouter = Router();

casoRouter.get("/", controller.findAll);
casoRouter.get("/encurso", controller.findCurrent);
casoRouter.get("/:id/abogados", controller.findAbogadosByCaso);
casoRouter.get("/:id", controller.findOne);

casoRouter.post("/", controller.sanitizeCaso, controller.add);
casoRouter.put("/:id", controller.sanitizeCaso, controller.update);

casoRouter.patch(
  "/:id/finalizar/",
  controller.sanitizeFinalizarCaso,
  controller.finalizar
);
casoRouter.patch("/:id/cancelar/", controller.deactivate);
