import { controller } from "./cuota.controller.js";
import { Router } from "express";

export const cuotaRouter = Router();
cuotaRouter.get("/", controller.findAll);
cuotaRouter.get("/impagas", controller.findUnpaid);

export const cuotaPorCasoRouter = Router({ mergeParams: true });
cuotaPorCasoRouter.get("/siguiente/", controller.findNearest);
cuotaPorCasoRouter.get("/", controller.findByCaso);
cuotaPorCasoRouter.patch("/cancelar/", controller.cancelFee);

cuotaPorCasoRouter.patch(
  "/:numero",
  controller.sanitize,
  controller.collectFee
);
