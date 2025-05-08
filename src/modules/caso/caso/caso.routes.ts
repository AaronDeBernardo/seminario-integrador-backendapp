import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./caso.controller.js";
import { Router } from "express";

export const casoRouter = Router();

// GET

casoRouter.get("/", authMiddlewares.verifyEmpleado, controller.findAll);

casoRouter.get(
  "/cliente/:id_cliente",
  authMiddlewares.verifyCliente,
  controller.findByCliente
);

casoRouter.get(
  "/encurso/",
  authMiddlewares.verifyEmpleado,
  controller.findCurrent
);

casoRouter.get(
  "/:id/abogados",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe estar asignado al caso
  controller.findAbogadosByCaso
);

casoRouter.get("/:id", authMiddlewares.verifyEmpleado, controller.findOne); //Si no es admin, debe estar asignado al caso

// POST PUT PATCH

casoRouter.post(
  "/",
  authMiddlewares.verifyEmpleado,
  controller.sanitizeCaso,
  controller.add
);

casoRouter.put(
  "/:id",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe ser el abogado principal del caso
  controller.sanitizeCaso,
  controller.update
);

casoRouter.patch(
  "/:id/finalizar/",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe ser el abogado principal del caso
  controller.sanitizeFinalizarCaso,
  controller.finalizar
);

casoRouter.patch(
  "/:id/cancelar/",
  authMiddlewares.verifyEmpleado, //Si no es admin, debe ser el abogado principal del caso
  controller.deactivate
);
