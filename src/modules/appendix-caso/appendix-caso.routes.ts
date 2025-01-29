import { Router } from "express";
import comentarioRouter from "../appendix-caso/comentario/comentario.routes.js";

export const appendixCasoRouter = Router();

appendixCasoRouter.use("/comentarios/", comentarioRouter);
