import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./horario-turno.controller.js";
import { Router } from "express";

export const horarioTurnoRouter = Router();

horarioTurnoRouter.get("/disponibles", controller.findAvailable);
horarioTurnoRouter.get("/", controller.findAll);

horarioTurnoRouter.post(
  "/",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.add
);

horarioTurnoRouter.put(
  "/:id",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.update
);

horarioTurnoRouter.patch(
  "/:id",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.update
);

horarioTurnoRouter.patch(
  "/deactivate/:id",
  authMiddlewares.verifyAbogado,
  controller.logicalDelete
);
