import { controller } from "./cuota.controller.js";
import { Router } from "express";

export const cuotaRouter = Router();

cuotaRouter.get("/", controller.findAll);
cuotaRouter.get("/nearest/:id_caso", controller.findNearest);
cuotaRouter.patch(
  "/:id_caso/:numero",
  controller.sanitize,
  controller.collectFee
);
