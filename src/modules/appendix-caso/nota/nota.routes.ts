import { Router } from "express";
import { controller } from "./nota.controller.js";

export const notaRouter = Router();

notaRouter.get("/", controller.findAll);
notaRouter.get("/:id_caso", controller.findByCaso);
notaRouter.post("/", controller.sanitize, controller.add);
notaRouter.put(
  "/:id_caso/:id_abogado/:fecha_hora",
  controller.sanitize,
  controller.update
);
notaRouter.delete("/:id_caso/:id_abogado/:fecha_hora", controller.delete);

export default notaRouter;
