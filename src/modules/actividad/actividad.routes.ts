import { Router } from "express";
import { controller } from "./actividad.controller.js";

export const actividadRouter = Router();

actividadRouter.get("/", controller.findAll);
actividadRouter.post("/", controller.sanitize, controller.add);
actividadRouter.put("/:id", controller.sanitize, controller.update);
actividadRouter.patch("/deactivate/:id", controller.logicalDelete);
