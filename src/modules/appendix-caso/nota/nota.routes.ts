import { controller } from "./nota.controller.js";
import { Router } from "express";

export const notaRouter = Router();

notaRouter.get("/", controller.findAll);
notaRouter.get("/:id_caso", controller.findByCaso);
notaRouter.post("/", controller.sanitize, controller.add);
notaRouter.put("/:id", controller.sanitize, controller.update);
notaRouter.delete("/:id", controller.delete);
