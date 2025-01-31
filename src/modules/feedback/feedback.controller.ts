import { Abogado } from "../usuario/abogado/abogado.entity.js";
import { Cliente } from "../usuario/cliente/cliente.entity.js";
import { Feedback } from "./feedback.entity.js";
import { FeedbackDTO } from "./feedback.dto.js";
import { handleError } from "../../utils/error-handler.js";
import { Request, Response, NextFunction } from "express";
import { orm } from "../../config/db.config.js";
import { validateEntity, validateNumericId } from "../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const feedbacks = await em.find(
        Feedback,
        {},
        { populate: ["abogado", "cliente"] }
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
        { abogado: id_abogado },
        { populate: ["cliente"] }
      );
      const data = feedbacks.map((feedback) => new FeedbackDTO(feedback));
      res
        .status(200)
        .json({ message: "Feedbacks del abogado encontrados.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const id_cliente = validateNumericId(req.params.id_cliente, "id_cliente");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const fecha_hora = new Date();

      const cliente = await em.findOneOrFail(Cliente, { usuario: id_cliente });
      const abogado = await em.findOneOrFail(Abogado, { usuario: id_abogado });

      const feedback = em.create(Feedback, {
        cliente,
        abogado,
        descripcion: req.body.sanitizedInput.descripcion,
        puntuacion: req.body.sanitizedInput.puntuacion,
        fecha_hora,
      });

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
        descripcion: req.body.descripcion?.trim(),
        puntuacion: parseInt(req.body.puntuacion, 10),
      };

      if (isNaN(req.body.sanitizedInput.puntuacion)) {
        throw new Error("La puntuación debe ser un número válido.");
      }

      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
