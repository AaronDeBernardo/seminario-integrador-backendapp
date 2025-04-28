import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./precio-jus.controller.js";
import { Router } from "express";

export const precioJusRouter = Router();

precioJusRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);
precioJusRouter.get("/latest", controller.findLatest);

precioJusRouter.post(
  "/",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.add
);
