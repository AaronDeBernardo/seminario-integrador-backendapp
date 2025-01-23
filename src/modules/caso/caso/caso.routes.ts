import { Router } from "express";
import { controller } from "./caso.controller.js";

export const casoRouter = Router();

casoRouter.get("/", controller.findAll);
casoRouter.get("/encurso", controller.findCurrent);
casoRouter.get("/:id", controller.findOne);
casoRouter.post("/", controller.sanitize, controller.add);
casoRouter.put("/:id", controller.sanitize, controller.update);
casoRouter.patch("/deactivate/:id", controller.deactivate);
