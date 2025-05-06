import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./abogado.controller.js";
import { createFileUploadMiddleware } from "../../../middleware/multer.config.js";
import { politicasService } from "../../misc/politicas/politicas.service.js";
import { Router } from "express";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

const politicas = await politicasService.getPoliticas();

const fileUploadMiddleware = createFileUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png"],
  fieldName: "foto",
  maxFileSizeMB: politicas.tam_max_foto_usuario_mb,
});

export const abogadoRouter = Router();

abogadoRouter.get(
  "/disponibles",
  authMiddlewares.verifyAdmin,
  controller.findAvailable
);

abogadoRouter.get(
  "/disponibles/caso/:id_caso",
  authMiddlewares.verifyAdmin,
  controller.findAvailableForCaso
);

abogadoRouter.get("/:id", authMiddlewares.verifyAdmin, controller.findOne);

abogadoRouter.get(
  "/:id/especialidades",
  authMiddlewares.verifyEmpleado,
  controller.findEspecialidades
);

abogadoRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);

abogadoRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  fileUploadMiddleware,
  controller.sanitize,
  controller.add
);
abogadoRouter.put(
  "/:id",
  authMiddlewares.verifyAdmin,
  fileUploadMiddleware,
  controller.sanitize,
  controller.update
);

abogadoRouter.patch(
  "/:id",
  authMiddlewares.verifyAdmin,
  fileUploadMiddleware,
  controller.sanitize,
  controller.update
);

abogadoRouter.patch(
  "/deactivate/:id",
  authMiddlewares.verifyAdmin,
  usuarioController.logicalDelete
);
