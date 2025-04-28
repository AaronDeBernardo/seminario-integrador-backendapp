import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./noticia.controller.js";
import { Router } from "express";

export const noticiaRouter = Router();

noticiaRouter.get("/:id", controller.findOne);
noticiaRouter.get("/", controller.findAll);

noticiaRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.add
);

noticiaRouter.put(
  "/:id",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.update
);

noticiaRouter.patch(
  "/deactivate/:id",
  authMiddlewares.verifyAdmin,
  controller.deactivate
);
