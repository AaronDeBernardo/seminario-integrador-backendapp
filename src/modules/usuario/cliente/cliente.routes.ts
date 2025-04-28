import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./cliente.controller.js";
import { Router } from "express";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

export const clienteRouter = Router();

clienteRouter.get("/:id", authMiddlewares.verifyEmpleado, controller.findOne);

clienteRouter.get("/", authMiddlewares.verifyEmpleado, controller.findAll);

clienteRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.add
);

clienteRouter.put(
  "/:id",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.update
);

clienteRouter.patch(
  "/:id",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.update
);

clienteRouter.patch(
  "/deactivate/:id",
  authMiddlewares.verifyAdmin,
  usuarioController.logicalDelete
);
