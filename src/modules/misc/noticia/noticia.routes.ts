import { Router } from "express";
import { controller } from "./noticia.controller.js";

export const noticiaRouter = Router();

noticiaRouter.get("/:id", controller.findOne);
noticiaRouter.get("/", controller.findAll);
noticiaRouter.post("/", controller.sanitize, controller.add);
noticiaRouter.put("/:id", controller.sanitize, controller.update);
noticiaRouter.patch("/deactivate/:id", controller.deactivate);
