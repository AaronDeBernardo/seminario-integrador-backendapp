import { Router } from "express";
import { controller } from "./abogado-caso.controller.js";

export const abogadoCasoRouter = Router();

abogadoCasoRouter.get("/:id_caso", controller.findByCaso);
abogadoCasoRouter.post("/", controller.sanitize, controller.link);
abogadoCasoRouter.patch("/desvincular/:id", controller.unlink);
