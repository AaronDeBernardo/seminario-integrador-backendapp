import { controller } from "./abogado-caso.controller.js";
import { Router } from "express";

export const abogadoCasoRouter = Router();

abogadoCasoRouter.get("/:id_caso", controller.findByCaso);
abogadoCasoRouter.post("/", controller.sanitize, controller.link);
abogadoCasoRouter.patch("/:id/desvincular", controller.unlink);
