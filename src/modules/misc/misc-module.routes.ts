import { Router } from "express";
import { noticiaRouter } from "./noticia/noticia.routes.js";

export const miscModuleRouter = Router();

miscModuleRouter.use("/noticia", noticiaRouter);
