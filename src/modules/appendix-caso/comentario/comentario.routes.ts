import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./comentario.controller.js";
import { Router } from "express";

export const comentarioRouter = Router();

comentarioRouter.get(
  "/:id_caso",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe estar asignado al caso
  controller.findByCaso
);

comentarioRouter.post(
  "/",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.addOrReply
);

comentarioRouter.post(
  "/:id_padre",
  authMiddlewares.verifyAbogado,
  controller.sanitize,
  controller.addOrReply
);

comentarioRouter.delete(
  "/:id",
  authMiddlewares.verifyAbogado,
  controller.delete
);
