import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./nota.controller.js";
import { Router } from "express";

export const notaRouter = Router();

notaRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);

notaRouter.get(
  "/:id_caso",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe estar asignado al caso
  controller.findByCaso
);

notaRouter.post(
  "/",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.add
);

notaRouter.put(
  "/:id",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.update
);

notaRouter.delete("/:id", authMiddlewares.verifyAbogado, controller.delete);
