import { Router } from "express";
import { controller } from "./reseteo-clave.controller";

export const reseteoClaveRouter = Router();

reseteoClaveRouter.post("/", controller.add);
reseteoClaveRouter.post("/:codigo", controller.recoverPassword);
