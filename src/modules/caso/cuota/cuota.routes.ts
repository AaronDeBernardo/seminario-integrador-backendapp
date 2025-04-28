import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./cuota.controller.js";
import { Router } from "express";

export const cuotaRouter = Router();

cuotaRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);
cuotaRouter.get("/impagas", authMiddlewares.verifyAdmin, controller.findUnpaid);

export const cuotaPorCasoRouter = Router({ mergeParams: true });

cuotaPorCasoRouter.get(
  "/siguiente/",
  authMiddlewares.verifyAdmin,
  controller.findNearest
);

cuotaPorCasoRouter.get("/", authMiddlewares.verifyAdmin, controller.findByCaso);

cuotaPorCasoRouter.patch(
  "/cancelar/",
  authMiddlewares.verifyAdmin,
  controller.cancelFee
);

cuotaPorCasoRouter.patch(
  "/:numero",
  authMiddlewares.verifyAdmin,
  controller.sanitize,
  controller.collectFee
);
