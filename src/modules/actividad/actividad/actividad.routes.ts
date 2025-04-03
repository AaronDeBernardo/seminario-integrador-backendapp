import { controller } from "./actividad.controller.js";
import { Router } from "express";

export const actividadRouter = Router();

actividadRouter.get("/", controller.findAll);
actividadRouter.post("/", controller.sanitize, controller.add);
actividadRouter.put("/:id", controller.sanitize, controller.update);
actividadRouter.patch("/:id/deactivate", controller.logicalDelete);
