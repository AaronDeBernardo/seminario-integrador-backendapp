import { NextFunction, Request, Response } from "express";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { ReseteoClave } from "./reseteo-clave.entity.js";
import { validateNumericId } from "../../../utils/validators.js";

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
      handleError(error, res);
    }
  },

  recoverPassword: async (req: Request, res: Response) => {},

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        usuario: validateNumericId(req.body.id_usuario, "id_usuario"),
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
