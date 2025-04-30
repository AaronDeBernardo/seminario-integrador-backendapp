import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./recordatorio.controller.js";
import { Router } from "express";

export const recordatorioRouter = Router();

recordatorioRouter.get(
  "/:id_caso",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe estar asignado al caso
  controller.findByCaso
);

recordatorioRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);

recordatorioRouter.post(
  "/",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.add
);

recordatorioRouter.put(
  "/:id",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.update
);

recordatorioRouter.delete(
  "/:id",
  authMiddlewares.verifyAbogado,
  controller.delete
);
