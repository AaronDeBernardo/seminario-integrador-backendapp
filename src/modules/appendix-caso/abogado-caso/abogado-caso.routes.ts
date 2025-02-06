import { Router } from "express";
import { controller } from "./abogado-caso.controller.js";

export const abogadoCasoRouter = Router();

abogadoCasoRouter.get("/", controller.findAll);
abogadoCasoRouter.get("/:id_caso", controller.findByCaso);
abogadoCasoRouter.post("/", controller.sanitize, controller.add);
abogadoCasoRouter.patch(
  "/vincular/:id_caso",
  controller.sanitize,
  controller.link
);
abogadoCasoRouter.patch("/desvincular/:id_caso/:id_abogado", controller.unlink);
abogadoCasoRouter.patch("/deactivate/:id", controller.deactivate);

export default abogadoCasoRouter;
