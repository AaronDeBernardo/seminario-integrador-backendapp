import { Router } from "express";
import { controller } from "./caso.controller.js";

export const casoRouter = Router();

casoRouter.get("/", controller.findAll);
casoRouter.get("/encurso", controller.findCurrent);
casoRouter.get("/:id", controller.findOne);

casoRouter.post("/", controller.sanitizeCaso, controller.add);
casoRouter.put("/:id", controller.sanitizeCaso, controller.update);

casoRouter.patch(
  "/finalizar/:id",
  controller.sanitizeFinalizarCaso,
  controller.finalizar
);
casoRouter.patch("/cancelar/:id", controller.deactivate);
