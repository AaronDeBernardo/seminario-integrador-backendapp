import { especialidadRouter } from "./especialidad/especialidad.routes.js";
import { Router } from "express";

export const especialidadModuleRouter = Router();

especialidadModuleRouter.use("/", especialidadRouter);
