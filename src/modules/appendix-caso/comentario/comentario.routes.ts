import { Router } from "express";
import { controller } from "./comentario.controller.js";

export const comentarioRouter = Router();

comentarioRouter.get("/:id_caso", controller.findAll);
comentarioRouter.post(
  "/:id_caso/:id_abogado",
  controller.sanitize,
  controller.add
);
comentarioRouter.post(
  "/:id_caso/:id_abogado/:id",
  controller.sanitize,
  controller.reply
);
comentarioRouter.delete("/:id_caso/:id_abogado/:id", controller.delete);
