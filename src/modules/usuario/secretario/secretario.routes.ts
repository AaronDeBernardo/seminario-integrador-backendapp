import { controller } from "./secretario.controller.js";
import { Router } from "express";
import { controller as usuarioController } from "../usuario/usuario.controller.js";

export const secretarioRouter = Router();

secretarioRouter.get("/:id", controller.findOne);
secretarioRouter.get("/", controller.findAll);
secretarioRouter.post("/", controller.sanitize, controller.add);
secretarioRouter.put("/:id", controller.sanitize, controller.update);
secretarioRouter.patch("/:id", controller.sanitize, controller.update);
secretarioRouter.patch("/deactivate/:id", usuarioController.logicalDelete);
