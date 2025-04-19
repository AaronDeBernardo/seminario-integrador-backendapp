import { controller } from "./especialidad.controller.js";
import { Router } from "express";

export const especialidadRouter = Router();

especialidadRouter.get("/:id", controller.findOne);
especialidadRouter.get("/", controller.findAll);
