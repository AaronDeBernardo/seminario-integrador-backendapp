import { controller } from "./turno-otorgado.controller.js";
import { Router } from "express";

export const turnoOtorgadoRouter = Router();

turnoOtorgadoRouter.get("/:id_abogado", controller.findByAbogado);
turnoOtorgadoRouter.post("/", controller.sanitize, controller.add);
