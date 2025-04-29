import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./usuario.controller.js";
import { createFileUploadMiddleware } from "../../../middleware/multer.config.js";
import { Router } from "express";

const fileUploadMiddleware = createFileUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png"],
  fieldName: "foto",
});

export const usuarioRouter = Router();

usuarioRouter.patch(
  "/me",
  authMiddlewares.verifyUsuario,
  fileUploadMiddleware,
  controller.sanitizeSelfUpdate,
  controller.selfUpdate
);
