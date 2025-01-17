import { Router } from "express";
import { actividadRouter } from "./actividad/actividad.routes.js";
import { actividadRealizadaRouter } from "./actividad-realizada/actividad-realizada.routes.js";

export const actividadModuleRouter = Router();

actividadModuleRouter.use("/realizadas", actividadRealizadaRouter);
actividadModuleRouter.use("/", actividadRouter);
