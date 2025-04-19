import { controller } from "./feedback.controller.js";
import { Router } from "express";

export const feedbackRouter = Router();

feedbackRouter.get("/:id_abogado", controller.findAllByAbogado);
feedbackRouter.get("/", controller.findAll);
feedbackRouter.get(
  "/abogados-calificables/:id_caso",
  controller.findAbogadosForFeedback
);
feedbackRouter.post("/", controller.sanitize, controller.add);
