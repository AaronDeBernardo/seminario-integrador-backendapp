import { Router } from "express";
import { controller } from "./feedback.controller.js";

export const feedbackRouter = Router();

feedbackRouter.get("/:id_abogado", controller.findAllByAbogado);
feedbackRouter.get("/", controller.findAll);
feedbackRouter.get(
  "/abogados-calificables/:id_cliente",
  controller.findAbogadosForFeedback
);
feedbackRouter.post("/", controller.sanitize, controller.add);
