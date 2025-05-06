import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./usuario.controller.js";
import { createFileUploadMiddleware } from "../../../middleware/multer.config.js";
import { politicasService } from "../../misc/politicas/politicas.service.js";
import { Router } from "express";

const politicas = await politicasService.getPoliticas();

const fileUploadMiddleware = createFileUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png"],
  fieldName: "foto",
  maxFileSizeMB: politicas.tam_max_foto_usuario_mb,
});

export const usuarioRouter = Router();

usuarioRouter.patch(
  "/me",
  authMiddlewares.verifyUsuario,
  fileUploadMiddleware,
  controller.sanitizeSelfUpdate,
  controller.selfUpdate
);
