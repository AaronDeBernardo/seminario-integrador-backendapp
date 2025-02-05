import { Request, Response, NextFunction } from "express";
import { subMonths } from "date-fns";
import { Feedback } from "./feedback.entity.js";
import { FeedbackDTO } from "./feedback.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import {
  validateEntity,
  validateIntegerInRange,
  validateNumericId,
} from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const feedbacks = await em.find(
        Feedback,
        { fecha_hora: { $gte: subMonths(new Date(), 3) } },
        { populate: ["abogado.usuario", "cliente.usuario"] }
      );

      const data = feedbacks.map((feedback) => new FeedbackDTO(feedback));
      res.status(200).json({ message: "Feedbacks encontrados.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findAllByAbogado: async (req: Request, res: Response) => {
    try {
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const feedbacks = await em.find(
        Feedback,
        { abogado: id_abogado, fecha_hora: { $gte: subMonths(new Date(), 3) } },
        { populate: ["cliente.usuario"] }
      );

      const data = feedbacks.map((feedback) => new FeedbackDTO(feedback));
      res
        .status(200)
        .json({ message: "Feedbacks del abogado encontrados.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findAbogadosForFeedback: async (req: Request, res: Response) => {
    try {
      const id_cliente = validateNumericId(req.params.id_cliente, "id_cliente");

      /*Permite otorgar feedback sólo si no se envió un feedback anteriormente y si el caso finalizó hace menos de un mes. 
        Devolver todos los abogados y determinar cuál es el principal
      */
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      //TODO validar que el abogado sea calificable por el cliente logueado
      const feedback = em.create(Feedback, req.body.sanitizedInput);
      validateEntity(feedback);
      await em.flush();

      const data = new FeedbackDTO(feedback);
      res.status(201).json({ message: "Feedback creado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        cliente: validateNumericId(req.body.id_cliente, "id_cliente"),
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        descripcion: req.body.descripcion.trim(),
        puntuacion: validateIntegerInRange(
          req.body.puntuacion,
          1,
          10,
          "puntuacion"
        ),
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
