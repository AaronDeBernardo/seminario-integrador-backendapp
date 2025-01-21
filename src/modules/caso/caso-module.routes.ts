import { Router } from "express";
import { casoRouter } from "./caso/caso.routes.js";

export const casoModuleRouter = Router();

casoModuleRouter.use("/casos/", casoRouter);
