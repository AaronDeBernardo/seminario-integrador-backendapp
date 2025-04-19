import { controller } from "./precio-jus.controller.js";
import { Router } from "express";

export const precioJusRouter = Router();

precioJusRouter.get("/", controller.findAll);
precioJusRouter.get("/latest", controller.findLatest);
precioJusRouter.post("/", controller.sanitize, controller.add);
