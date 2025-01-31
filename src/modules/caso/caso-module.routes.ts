import abogadoCasoRouter from "../appendix-caso/abogado-caso/abogado-caso.routes.js";
import comentarioRouter from "../appendix-caso/comentario/comentario.routes.js";
import notaRouter from "../appendix-caso/nota/nota.routes.js";
import recordatorioRouter from "../appendix-caso/recordatorio/recordatorio.routes.js";
import { Router } from "express";

export const casoModuleRouter = Router();

casoModuleRouter.use("/abogados-casos/", abogadoCasoRouter);
casoModuleRouter.use("/comentarios/", comentarioRouter);
casoModuleRouter.use("/notas/", notaRouter);
casoModuleRouter.use("/recordatorios/", recordatorioRouter);
