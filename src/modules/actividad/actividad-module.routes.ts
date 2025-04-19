import { actividadRealizadaRouter } from "./actividad-realizada/actividad-realizada.routes.js";
import { actividadRouter } from "./actividad/actividad.routes.js";
import { Router } from "express";

export const actividadModuleRouter = Router();

actividadModuleRouter.use("/realizadas", actividadRealizadaRouter);
actividadModuleRouter.use("/", actividadRouter);
