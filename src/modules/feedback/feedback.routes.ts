import { Router } from "express";
import { controller } from "./feedback.controller.js";

export const feedbackRouter = Router();

feedbackRouter.get("/", controller.findAll);
feedbackRouter.get("/:id_abogado", controller.findAllByAbogado);
feedbackRouter.post(
  "/:id_cliente/:id_abogado",
  controller.sanitize,
  controller.add
);
