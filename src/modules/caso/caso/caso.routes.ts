import { Router } from "express";
import { controller } from "./caso.controller.js";

export const casoRouter = Router();

casoRouter.get("/", controller.findAll);
casoRouter.get("/:id", controller.findOne);
casoRouter.post("/", controller.sanitize, controller.create);
casoRouter.put("/:id", controller.sanitize, controller.update);
casoRouter.patch(
  "/desactivate/:id",
  controller.sanitize,
  controller.desactivate
);
