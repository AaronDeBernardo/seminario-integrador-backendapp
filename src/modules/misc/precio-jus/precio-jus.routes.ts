import { Router } from "express";
import { controller } from "./precio-jus.controller.js";

export const precioJusRouter = Router();

precioJusRouter.get("/", controller.findAll);
precioJusRouter.get("/latest", controller.findLatest);
precioJusRouter.post("/", controller.sanitize, controller.add);
