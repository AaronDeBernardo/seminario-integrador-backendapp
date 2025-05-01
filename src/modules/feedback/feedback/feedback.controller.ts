import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateIntegerInRange,
  validateNumericId,
} from "../../../utils/validators.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { Feedback } from "./feedback.entity.js";
import { FeedbackDTO } from "./feedback.dto.js";
import { feedbackService } from "./feedback.service.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { subMonths } from "date-fns";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const feedbacks = await em.find(
        Feedback,
        { fecha_hora: { $gte: subMonths(new Date(), 3) } },
        {
          populate: ["abogado.usuario", "caso.cliente.usuario"],
        }
      );

      const data = feedbacks.map((feedback) => new FeedbackDTO(feedback));
      res.status(200).json(new ApiResponse("Feedbacks encontrados.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAllByAbogado: async (req: Request, res: Response) => {
    try {
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const feedbacks = await em.find(
        Feedback,
        {
          abogado: id_abogado,
          fecha_hora: { $gte: subMonths(new Date(), 3) },
        },
        { populate: ["caso.cliente.usuario"] }
      );

      const data = feedbacks.map((feedback) => new FeedbackDTO(feedback));
      res
        .status(200)
        .json(new ApiResponse("Feedbacks del abogado encontrados.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAbogadosForFeedback: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const caso = await em.findOneOrFail(Caso, { id: id_caso });

      if (caso.cliente.usuario.id !== req.usuario!.id) {
        res.status(403).json(new ApiResponse("Acceso denegado."));
        return;
      }

      if (caso.estado !== EstadoCasoEnum.FINALIZADO) {
        res.status(400).json(new ApiResponse("El caso no fue finalizado."));
        return;
      }

      const data = await feedbackService.getAbogadosForFeedback(id_caso);

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los abogados calificables del caso fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const caso = await em.findOneOrFail(Caso, {
        id: req.body.sanitizedInput.caso,
      });

      if (caso.cliente.usuario.id !== req.usuario!.id) {
        res.status(403).json(new ApiResponse("Acceso denegado."));
        return;
      }

      if (caso.estado !== EstadoCasoEnum.FINALIZADO) {
        res.status(400).json(new ApiResponse("El caso no fue finalizado."));
        return;
      }

      const calificable = await feedbackService.isAbogadoCalificable(
        req.body.sanitizedInput.abogado,
        req.body.sanitizedInput.caso
      );

      if (!calificable)
        throw new HttpError(
          400,
          "No se le puede otorgar feedback al abogado para el caso seleccionado."
        );

      const feedback = em.create(Feedback, req.body.sanitizedInput);
      validateEntity(feedback);

      await em.flush();
      await em.refresh(feedback);

      res.status(201).json(new ApiResponse("Feedback registrado.", feedback));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        descripcion: req.body.descripcion?.trim(),

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
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
