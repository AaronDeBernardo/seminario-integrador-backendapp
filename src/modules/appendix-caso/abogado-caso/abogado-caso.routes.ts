import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./abogado-caso.controller.js";
import { Router } from "express";

export const abogadoCasoRouter = Router();

abogadoCasoRouter.post(
  "/",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe ser el abogado principal del caso
  controller.sanitize,
  controller.link
);

abogadoCasoRouter.patch(
  "/:id/desvincular",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe ser el abogado principal del caso
  controller.unlink
);
