import { Router } from "express";
import { controller } from "./especialidad.controller.js";

export const especialidadRouter = Router();

especialidadRouter.get("/:id", controller.findOne);
especialidadRouter.get("/", controller.findAll);


