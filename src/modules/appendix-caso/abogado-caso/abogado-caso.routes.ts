import { controller } from "./abogado-caso.controller.js";
import { Router } from "express";

export const abogadoCasoRouter = Router();

abogadoCasoRouter.post("/", controller.sanitize, controller.link);
abogadoCasoRouter.patch("/:id/desvincular", controller.unlink);
