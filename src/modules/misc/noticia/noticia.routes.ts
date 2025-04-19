import { controller } from "./noticia.controller.js";
import { Router } from "express";

export const noticiaRouter = Router();

noticiaRouter.get("/:id", controller.findOne);
noticiaRouter.get("/", controller.findAll);
noticiaRouter.post("/", controller.sanitize, controller.add);
noticiaRouter.put("/:id", controller.sanitize, controller.update);
noticiaRouter.patch("/deactivate/:id", controller.deactivate);
