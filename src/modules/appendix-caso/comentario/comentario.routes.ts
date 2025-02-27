import { Router } from "express";
import { controller } from "./comentario.controller.js";

export const comentarioRouter = Router();

comentarioRouter.get("/:id_caso", controller.findByCaso);
comentarioRouter.post("/", controller.sanitize, controller.addOrReply);
comentarioRouter.post("/:id", controller.sanitize, controller.addOrReply);
comentarioRouter.delete("/:id", controller.delete);
