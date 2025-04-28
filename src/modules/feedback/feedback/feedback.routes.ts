import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./feedback.controller.js";
import { Router } from "express";

export const feedbackRouter = Router();

feedbackRouter.get(
  "/:id_abogado",
  authMiddlewares.verifyAdmin,
  controller.findAllByAbogado
);

feedbackRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);

feedbackRouter.get(
  "/abogados-calificables/:id_caso",
  authMiddlewares.verifyCliente,
  controller.findAbogadosForFeedback
);

feedbackRouter.post(
  "/",
  authMiddlewares.verifyCliente,
  controller.sanitize,
  controller.add
);
