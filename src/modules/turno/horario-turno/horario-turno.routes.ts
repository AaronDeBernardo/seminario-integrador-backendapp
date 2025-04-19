import { controller } from "./horario-turno.controller.js";
import { Router } from "express";

export const horarioTurnoRouter = Router();

horarioTurnoRouter.get("/disponibles", controller.findAvailable);
horarioTurnoRouter.get("/", controller.findAll);
horarioTurnoRouter.post("/", controller.sanitize, controller.add);
horarioTurnoRouter.put("/:id", controller.sanitize, controller.update);
horarioTurnoRouter.patch("/:id", controller.sanitize, controller.update);
horarioTurnoRouter.patch("/deactivate/:id", controller.logicalDelete);
