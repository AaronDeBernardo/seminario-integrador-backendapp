import { Request, Response } from "express";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { Rol } from "./rol.entity.js";

const em = orm.em;

export const controller = {
  findAll: async (req: Request, res: Response) => {
    try {
      const roles = await em.findAll(Rol);

      res.status(200).json({
        message: "Todos los roles fueron encontrados.",
        data: roles,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
