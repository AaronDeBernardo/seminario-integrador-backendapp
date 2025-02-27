import { Request, Response } from "express";
import { subWeeks } from "date-fns";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { Recordatorio } from "./recordatorio.entity.js";
import { RecordatorioDTO } from "./recordatorio.dto.js";
import {
  validateDateTime,
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { abogadoCasoService } from "../abogado-caso/abogado-caso.service.js";

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
      res.status(200).json({ message: "Recordatorios encontrados.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
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
        .json({ message: "Recordatorios del caso encontrados.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await abogadoCasoService.isAbogadoWorkingOnCaso(
        req.body.sanitizedInput.abogado,
        req.body.sanitizedInput.caso
      );
      if (response === false)
        throw new HttpError(
          400,
          "El abogado no se encuentra trabajando en el caso."
        );

      const recordatorio = em.create(Recordatorio, req.body.sanitizedInput);
      validateEntity(recordatorio);
      await em.flush();

      const data = new RecordatorioDTO(recordatorio);
      res.status(201).json({ message: "Recordatorio creado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const response = await abogadoCasoService.isAbogadoWorkingOnCaso(
        req.body.sanitizedInput.abogado,
        req.body.sanitizedInput.caso
      );
      if (response === false)
        throw new HttpError(
          400,
          "El abogado no se encuentra trabajando en el caso."
        );

      const id = validateNumericId(req.params.id, "id");
      const recordatorio = await em.findOneOrFail(Recordatorio, id);

      em.assign(recordatorio, req.body.sanitizedInput);
      validateEntity(recordatorio);
      await em.flush();

      const data = new RecordatorioDTO(recordatorio);
      res.status(200).json({ message: "Recordatorio actualizado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      //TODO Validar que el recordatorio sea del abogado que está logueado
      const id = validateNumericId(req.params.id, "id");
      const recordatorio = em.getReference(Recordatorio, id);
      await em.removeAndFlush(recordatorio);

      res.status(200).json({ message: "Recordatorio eliminado." });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: Function) => {
    try {
      req.body.sanitizedInput = {
        //req.method==="POST" para no permitir cambiar el caso en un put o patch
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        //TODO Validar que sea el mismo cuando existan sesiones, u obtenerlo de la sesión

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
        res.status(400).json({
          message: "La fecha y hora límite deben ser posteriores a la actual.",
        });
        return;
      }

      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
