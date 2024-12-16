import { Router } from "express";
import { controller } from "./abogado.controller.js";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

export const abogadoRouter = Router();

abogadoRouter.get("/:id", controller.findOne);
abogadoRouter.get("/", controller.findAll);

abogadoRouter.post(
  "/",
  usuarioController.sanitize,
  controller.sanitize,
  controller.add
);

abogadoRouter.put(
  "/:id",
  usuarioController.sanitize,
  controller.sanitize,
  controller.update
);

abogadoRouter.patch(
  "/:id",
  usuarioController.sanitize,
  controller.sanitize,
  controller.update
);

abogadoRouter.patch("/deactivate/:id", usuarioController.logicalDelete);
