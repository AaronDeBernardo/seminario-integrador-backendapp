import { NextFunction, Request, Response } from "express";
import {
  validateDateTime,
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { abogadoCasoService } from "../abogado-caso/abogado-caso.service.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { Recordatorio } from "./recordatorio.entity.js";
import { RecordatorioDTO } from "./recordatorio.dto.js";
import { subWeeks } from "date-fns";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const dateFrom = subWeeks(new Date(), 1);
      const recordatorios = await em.find(
        Recordatorio,
        { fecha_hora_limite: { $gte: dateFrom } },
        {
          populate: [
            "abogado.usuario",
            "caso.cliente.usuario",
            "caso.especialidad",
          ],
        }
      );

      const data = recordatorios.map(
        (recordatorio) => new RecordatorioDTO(recordatorio)
      );
      res.status(200).json(new ApiResponse("Recordatorios encontrados.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      if (req.usuario!.is_admin === false)
        await abogadoCasoService.checkAbogadoWorkingOnCaso(
          req.usuario!.id,
          id_caso,
          false
        );

      const recordatorios = await em.find(
        Recordatorio,
        { caso: id_caso },
        {
          populate: ["abogado.usuario"],
        }
      );

      const data = recordatorios.map(
        (recordatorio) => new RecordatorioDTO(recordatorio)
      );
      res
        .status(200)
        .json(new ApiResponse("Recordatorios del caso encontrados.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      await abogadoCasoService.checkAbogadoWorkingOnCaso(
        req.body.sanitizedInput.abogado,
        req.body.sanitizedInput.caso,
        true
      );

      const recordatorio = em.create(Recordatorio, req.body.sanitizedInput);
      validateEntity(recordatorio);
      await em.flush();

      const data = new RecordatorioDTO(recordatorio);
      res.status(201).json(new ApiResponse("Recordatorio creado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const recordatorio = await em.findOneOrFail(Recordatorio, {
        id,
        abogado: { usuario: req.usuario!.id },
      });

      await abogadoCasoService.checkAbogadoWorkingOnCaso(
        req.usuario!.id,
        recordatorio.caso.id,
        true
      );

      em.assign(recordatorio, req.body.sanitizedInput);
      validateEntity(recordatorio);
      await em.flush();

      const data = new RecordatorioDTO(recordatorio);
      res.status(200).json(new ApiResponse("Recordatorio actualizado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const recordatorio = await em.findOneOrFail(Recordatorio, {
        id,
        abogado: { usuario: req.usuario!.id },
      });

      await abogadoCasoService.checkAbogadoWorkingOnCaso(
        req.usuario!.id,
        recordatorio.caso.id,
        true
      );

      await em.removeAndFlush(recordatorio);

      res.status(200).json(new ApiResponse("Recordatorio eliminado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        caso:
          req.method === "POST"
            ? validateNumericId(req.body.id_caso, "id_caso")
            : undefined,
        abogado: req.usuario!.id,
        descripcion: req.body.descripcion?.trim(),
        fecha_hora_limite: validateDateTime(
          req.body.fecha_hora_limite,
          "fecha_hora_limite"
        ),
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      if (req.body.sanitizedInput.fecha_hora_limite <= new Date()) {
        res
          .status(400)
          .json(
            new ApiResponse(
              "La fecha y hora límite deben ser posteriores a la actual."
            )
          );
        return;
      }

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
