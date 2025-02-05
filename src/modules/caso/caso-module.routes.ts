import { Router } from "express";
import { casoRouter } from "./caso/caso.routes.js";
import { cuotaRouter } from "./cuota/cuota.routes.js";
import { documentoRouter } from "./documento/documento.routes.js";

export const casoModuleRouter = Router();

casoModuleRouter.use("/cuotas/", cuotaRouter);
casoModuleRouter.use("/documentos/", documentoRouter);
casoModuleRouter.use("/", casoRouter);
