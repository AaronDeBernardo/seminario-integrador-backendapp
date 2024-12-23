import { Router } from "express";
import { controller } from "./abogado-especialidad.controller.js";

export const abogadoEspecialidadRouter = Router();


abogadoEspecialidadRouter.get("/", controller.findAll); 
abogadoEspecialidadRouter.get("/:id_abogado/:id_especialidad", controller.findOne); 

abogadoEspecialidadRouter.post("/", controller.create);

abogadoEspecialidadRouter.put("/:id_abogado/:id_especialidad", controller.update);


