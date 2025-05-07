import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./politicas.controller.js";
import { Router } from "express";

export const politicasRouter = Router();

politicasRouter.get("/", authMiddlewares.verifyEmpleado, controller.findOne);
