import { Request, Response } from "express";
import { Rol } from "./rol.entity.js";
import { orm } from "../../../config/db.config.js";

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
      res.status(500).json({ message: error.message });
    }
  },
};
