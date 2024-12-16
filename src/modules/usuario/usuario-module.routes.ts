import { Router } from "express";
import { abogadoRouter } from "./abogado/abogado.routes.js";

export const usuarioModuleRouter = Router();

usuarioModuleRouter.use("/abogados/", abogadoRouter);
