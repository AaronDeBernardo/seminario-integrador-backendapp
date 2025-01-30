import { Router } from "express";
import comentarioRouter from "../appendix-caso/comentario/comentario.routes.js";
import abogadoCasoRouter from "../appendix-caso/abogado-caso/abogado-caso.routes.js";

export const casoModuleRouter = Router();

casoModuleRouter.use("/comentarios/", comentarioRouter);
casoModuleRouter.use("/abogados-casos/", abogadoCasoRouter);
