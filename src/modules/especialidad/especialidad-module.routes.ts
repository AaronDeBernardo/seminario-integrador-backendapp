import { Router } from "express";
import { especialidadRouter } from "./especialidad/especialidad.routes.js";

export const especialidadModuleRouter = Router();

especialidadModuleRouter.use("/", especialidadRouter);
