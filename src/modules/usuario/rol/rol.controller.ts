import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { Rol } from "./rol.entity.js";

const em = orm.em;

export const controller = {
  findAll: async (req: Request, res: Response) => {
    try {
      const roles = await em.findAll(Rol);

      res
        .status(200)
        .json(new ApiResponse("Todos los roles fueron encontrados.", roles));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
