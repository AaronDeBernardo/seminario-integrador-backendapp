import { controller } from "./reseteo-clave.controller.js";
import { Router } from "express";

export const reseteoClaveRouter = Router();

reseteoClaveRouter.post("/", controller.add);
reseteoClaveRouter.post("/:codigo", controller.recoverPassword);
