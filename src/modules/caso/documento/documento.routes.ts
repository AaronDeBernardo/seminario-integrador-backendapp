import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./documento.controller.js";
import { createFileUploadMiddleware } from "../../../middleware/multer.config.js";
import { Router } from "express";

const fileUploadMiddleware = createFileUploadMiddleware({
  allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  fieldName: "archivo",
});

export const documentoRouter = Router();

documentoRouter.get("/:id", authMiddlewares.verifyAbogado, controller.findOne);

documentoRouter.get(
  "/por-caso/:id_caso",
  authMiddlewares.verifyAbogado,
  controller.findAllByCaso
);

documentoRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);

documentoRouter.post(
  "/",
  authMiddlewares.verifyAbogado,
  fileUploadMiddleware,
  controller.sanitize,
  controller.add
);

documentoRouter.patch(
  "/deactivate/:id",
  authMiddlewares.verifyAbogado,
  controller.logicalDelete
);
