import { Router } from "express";
import { especialidadRouter } from "./especialidad/especialidad.routes.js";
import { abogadoEspecialidadRouter } from "./abogado-especialidad/abogado-especialidad.routes.js";


export const especialidadModuleRouter = Router();

especialidadModuleRouter.use("/", especialidadRouter);
especialidadModuleRouter.use("/abogados-especialidades/", abogadoEspecialidadRouter);

