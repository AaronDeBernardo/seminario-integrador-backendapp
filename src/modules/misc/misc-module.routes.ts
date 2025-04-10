import { Router } from "express";
import { noticiaRouter } from "./noticia/noticia.routes.js";
import { precioJusRouter } from "./precio-jus/precio-jus.routes.js";

export const miscModuleRouter = Router();

miscModuleRouter.use("/noticias", noticiaRouter);
miscModuleRouter.use("/precios-jus", precioJusRouter);
