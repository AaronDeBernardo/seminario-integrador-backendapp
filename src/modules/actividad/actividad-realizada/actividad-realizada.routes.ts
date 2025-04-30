import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./actividad-realizada.controller.js";
import { Router } from "express";

export const actividadRealizadaRouter = Router();

actividadRealizadaRouter.get(
  "/abogado/:id_abogado",
  authMiddlewares.verifyEmpleado,
  controller.findByAbogado
);

actividadRealizadaRouter.get(
  "/",
  authMiddlewares.verifyEmpleado,
  controller.findAll
);

actividadRealizadaRouter.post(
  "/",
  authMiddlewares.verifyEmpleado,
  controller.sanitize,
  controller.add
);

actividadRealizadaRouter.put(
  "/:id",
  authMiddlewares.verifyEmpleado,
  controller.sanitize,
  controller.update
);

actividadRealizadaRouter.delete(
  "/:id",
  authMiddlewares.verifyEmpleado,
  controller.delete
);
