import { Router } from "express";
import { controller } from "./turno-otorgado.controller.js";

export const turnoOtorgadoRouter = Router();

turnoOtorgadoRouter.get("/:id_abogado", controller.findByAbogado);
turnoOtorgadoRouter.post("/", controller.sanitize, controller.add);
