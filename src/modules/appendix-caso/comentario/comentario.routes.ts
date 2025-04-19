import { controller } from "./comentario.controller.js";
import { Router } from "express";

export const comentarioRouter = Router();

comentarioRouter.get("/:id_caso", controller.findByCaso);
comentarioRouter.post("/", controller.sanitize, controller.addOrReply);
comentarioRouter.post("/:id", controller.sanitize, controller.addOrReply);
comentarioRouter.delete("/:id", controller.delete);
