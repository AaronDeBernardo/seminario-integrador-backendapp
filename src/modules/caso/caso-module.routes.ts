import { Router } from "express";
import { casoRouter } from "./caso/caso.routes.js";
import { cuotaRouter } from "./cuota/cuota.routes.js";

export const casoModuleRouter = Router();

casoModuleRouter.use("/casos/", casoRouter);
casoModuleRouter.use("/cuotas/", cuotaRouter);
