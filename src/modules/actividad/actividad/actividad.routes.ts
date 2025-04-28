import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./actividad.controller.js";
import { Router } from "express";

export const actividadRouter = Router();

actividadRouter.get("/", authMiddlewares.verifyEmpleado, controller.findAll);

actividadRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.add
);

actividadRouter.put(
  "/:id",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.update
);

actividadRouter.patch(
  "/:id/deactivate",
  authMiddlewares.verifyAdmin,
  controller.logicalDelete
);
