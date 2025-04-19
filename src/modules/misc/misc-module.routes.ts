import { noticiaRouter } from "./noticia/noticia.routes.js";
import { precioJusRouter } from "./precio-jus/precio-jus.routes.js";
import { Router } from "express";

export const miscModuleRouter = Router();

miscModuleRouter.use("/noticias", noticiaRouter);
miscModuleRouter.use("/precios-jus", precioJusRouter);
