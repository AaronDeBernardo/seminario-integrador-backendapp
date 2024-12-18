import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { ReseteoClave } from "./reseteo-clave.entity.js";
import { validateId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  add: async (req: Request, res: Response) => {
    try {
      const reseteoClave = em.create(ReseteoClave, req.body.sanitizedInput);
      await em.flush();

      //TODO generar codigo

      //TODO enviar correo de recuperación

      res.status(201).json({
        message: "Código de recuperación enviado al email del usuario.",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  recoverPassword: async (req: Request, res: Response) => {},

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        usuario: validateId(req.body.id_usuario, "id_usuario"),
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      next();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
