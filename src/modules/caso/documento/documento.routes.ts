import { controller } from "./documento.controller.js";
import { handleFileUpload } from "../../../middleware/multer-pdf-image.config.js";
import { Router } from "express";

export const documentoRouter = Router();

documentoRouter.get("/:id", controller.findOne);
documentoRouter.get("/por-caso/:id_caso", controller.findAllByCaso);
documentoRouter.get("/", controller.findAll);

documentoRouter.post(
  "/",
  handleFileUpload,
  controller.sanitize,
  controller.add
);

documentoRouter.patch("/deactivate/:id", controller.logicalDelete);
