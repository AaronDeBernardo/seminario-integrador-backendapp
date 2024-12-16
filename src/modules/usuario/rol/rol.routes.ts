import { Router } from "express";
import { controller } from "./rol.controller.js";

export const rolRouter = Router();

rolRouter.get("/", controller.findAll);
