import { controller } from "./documento.controller.js";
import { Router } from "express";

export const documentoRouter = Router();

documentoRouter.get("/", controller.findAll);
documentoRouter.get("/:id_caso", controller.findAllByCaso);
documentoRouter.get("/:id_caso/:id", controller.findOne);
documentoRouter.post("/:id_caso", controller.sanitize, controller.add);
documentoRouter.patch("/:id_caso/:id", controller.delete);
