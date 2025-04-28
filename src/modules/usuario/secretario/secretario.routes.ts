import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./secretario.controller.js";
import { Router } from "express";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

export const secretarioRouter = Router();

secretarioRouter.get("/:id", authMiddlewares.verifyAdmin, controller.findOne);
secretarioRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);

secretarioRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.add
);

secretarioRouter.put(
  "/:id",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.update
);

secretarioRouter.patch(
  "/:id",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.update
);

secretarioRouter.patch(
  "/deactivate/:id",
  authMiddlewares.verifyAdmin,
  usuarioController.logicalDelete
);
