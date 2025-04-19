import { controller } from "./rol.controller.js";
import { Router } from "express";

export const rolRouter = Router();

rolRouter.get("/", controller.findAll);
