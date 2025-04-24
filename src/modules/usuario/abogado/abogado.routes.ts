import { controller } from "./abogado.controller.js";
import { createFileUploadMiddleware } from "../../../middleware/multer.config.js";
import { Router } from "express";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

const fileUploadMiddleware = createFileUploadMiddleware({
  allowedMimeTypes: ["image/jpeg", "image/png"],
  fieldName: "foto",
});

export const abogadoRouter = Router();

abogadoRouter.get("/disponibles", controller.findAvailable);
abogadoRouter.get(
  "/disponibles/caso/:id_caso",
  controller.findAvailableForCaso
);
abogadoRouter.get("/:id", controller.findOne);
abogadoRouter.get("/:id/especialidades", controller.findEspecialidades);
abogadoRouter.get("/", controller.findAll);

abogadoRouter.post(
  "/",
  fileUploadMiddleware,
  controller.sanitize,
  controller.add
);
abogadoRouter.put(
  "/:id",
  fileUploadMiddleware,
  controller.sanitize,
  controller.update
);

abogadoRouter.patch(
  "/:id",
  fileUploadMiddleware,
  controller.sanitize,
  controller.update
);

abogadoRouter.patch("/deactivate/:id", usuarioController.logicalDelete);
