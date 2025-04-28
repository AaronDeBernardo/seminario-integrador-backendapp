import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./especialidad.controller.js";
import { Router } from "express";

export const especialidadRouter = Router();

especialidadRouter.get(
  "/:id/abogados",
  authMiddlewares.verifyEmpleado,
  controller.findAbogados
);

especialidadRouter.get(
  "/:id",
  authMiddlewares.verifyEmpleado,
  controller.findOne
);

especialidadRouter.get("/", authMiddlewares.verifyEmpleado, controller.findAll);
