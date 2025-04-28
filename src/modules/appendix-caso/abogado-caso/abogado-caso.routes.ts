import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./abogado-caso.controller.js";
import { Router } from "express";

export const abogadoCasoRouter = Router();

abogadoCasoRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.link
);

abogadoCasoRouter.patch(
  "/:id/desvincular",
  authMiddlewares.verifyAdmin,
  controller.unlink
);
