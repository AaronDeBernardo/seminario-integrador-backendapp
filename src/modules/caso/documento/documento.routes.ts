import { controller } from "./documento.controller.js";
import { createFileUploadMiddleware } from "../../../middleware/multer.config.js";
import { Router } from "express";

const fileUploadMiddleware = createFileUploadMiddleware({
  allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  fieldName: "archivo",
});

export const documentoRouter = Router();

documentoRouter.get("/:id", controller.findOne);
documentoRouter.get("/por-caso/:id_caso", controller.findAllByCaso);
documentoRouter.get("/", controller.findAll);

documentoRouter.post(
  "/",
  fileUploadMiddleware,
  controller.sanitize,
  controller.add
);

documentoRouter.patch("/deactivate/:id", controller.logicalDelete);
