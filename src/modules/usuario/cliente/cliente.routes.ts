import { Router } from "express";
import { controller } from "./cliente.controller.js";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

export const clienteRouter = Router();

clienteRouter.get("/:id", controller.findOne);
clienteRouter.get("/", controller.findAll);
clienteRouter.post(
  "/",
  usuarioController.sanitize,
  controller.sanitize,
  controller.add
);

clienteRouter.put(
  "/:id",
  usuarioController.sanitize,
  controller.sanitize,
  controller.update
);

clienteRouter.patch(
  "/:id",
  usuarioController.sanitize,
  controller.sanitize,
  controller.update
);

clienteRouter.patch("/deactivate/:id", usuarioController.logicalDelete);
