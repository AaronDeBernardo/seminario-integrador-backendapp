import { Router } from "express";
import { controller } from "./noticia.controller.js";

export const noticiaRouter = Router();

noticiaRouter.get("/", controller.findAll);
noticiaRouter.post("/", controller.sanitize, controller.create);
noticiaRouter.get("/:id", controller.findOne);
noticiaRouter.put("/:id", controller.sanitize, controller.update);
noticiaRouter.patch("/desactivate/:id", controller.desactivate);
