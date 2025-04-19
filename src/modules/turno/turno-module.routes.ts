import { horarioTurnoRouter } from "./horario-turno/horario-turno.routes.js";
import { Router } from "express";
import { turnoOtorgadoRouter } from "./turno-otorgado/turno-otorgado.routes.js";

export const turnoModuleRoutes = Router();

turnoModuleRoutes.use("/horarios", horarioTurnoRouter);
turnoModuleRoutes.use("/", turnoOtorgadoRouter);
