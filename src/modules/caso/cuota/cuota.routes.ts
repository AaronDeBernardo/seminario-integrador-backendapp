import { Router } from "express";
import { controller } from "./cuota.controller.js";

export const cuotaRouter = Router();

cuotaRouter.get("/", controller.findAll);
cuotaRouter.get("/cercana", controller.findNearest);
cuotaRouter.post("/", controller.sanitize, controller.add);
cuotaRouter.patch("/:id", controller.collectFee);
