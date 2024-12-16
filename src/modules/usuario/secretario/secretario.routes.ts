import { Router } from "express";
import { controller } from "./secretario.controller.js";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

export const secretarioRouter = Router();

secretarioRouter.get("/:id", controller.findOne);
secretarioRouter.get("/", controller.findAll);
secretarioRouter.post(
  "/",
  usuarioController.sanitize,
  controller.sanitize,
  controller.add
);

secretarioRouter.put(
  "/:id",
  usuarioController.sanitize,
  controller.sanitize,
  controller.update
);

secretarioRouter.patch(
  "/:id",
  usuarioController.sanitize,
  controller.sanitize,
  controller.update
);

secretarioRouter.patch("/deactivate/:id", usuarioController.logicalDelete);
