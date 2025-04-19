import { controller } from "./actividad-realizada.controller.js";
import { Router } from "express";

export const actividadRealizadaRouter = Router();

actividadRealizadaRouter.get("/:id", controller.findByAbogado);
actividadRealizadaRouter.get("/", controller.findAll);
actividadRealizadaRouter.post("/", controller.sanitize, controller.add);
actividadRealizadaRouter.put("/:id", controller.sanitize, controller.update);
actividadRealizadaRouter.delete("/:id", controller.delete);
