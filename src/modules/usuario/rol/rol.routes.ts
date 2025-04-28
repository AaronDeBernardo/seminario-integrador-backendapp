import { authMiddlewares } from "../../auth/auth.middlewares.js";
import { controller } from "./rol.controller.js";
import { Router } from "express";

export const rolRouter = Router();

rolRouter.get("/", authMiddlewares.verifyAdmin, controller.findAll);
