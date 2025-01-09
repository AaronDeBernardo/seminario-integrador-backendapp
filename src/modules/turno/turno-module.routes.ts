import { Router } from "express";
import { horarioTurnoRouter } from "./horario-turno/horario-turno.routes.js";

export const turnoModuleRoutes = Router();

turnoModuleRoutes.use("/horarios", horarioTurnoRouter);
