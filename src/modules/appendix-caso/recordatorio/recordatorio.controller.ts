import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { handleError } from "../../../utils/error-handler.js";
import { Recordatorio } from "./recordatorio.entity.js";
import { RecordatorioDTO } from "./recordatorio.dto.js";
import { Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const recordatorios = await em.find(
        Recordatorio,
        {},
        { populate: ["abogado", "caso"] }
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
        { populate: ["abogado", "caso"] }
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
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const fecha_hora_limite = new Date(req.body.fecha_hora_limite);

      if (fecha_hora_limite <= new Date()) {
        res.status(400).json({
          message: "La fecha y hora límite deben ser posteriores a la actual.",
        });
        return;
      }

      const caso = await em.findOneOrFail(Caso, { id: id_caso });
      const abogado = await em.findOneOrFail(Abogado, { usuario: id_abogado });

      const recordatorioExistente = await em.findOne(Recordatorio, {
        caso: id_caso,
        abogado: id_abogado,
        fecha_hora_limite,
      });

      if (recordatorioExistente) {
        res.status(400).json({
          message: "Ya existe un recordatorio con la misma clave primaria.",
        });
        return;
      }

      const recordatorio = em.create(Recordatorio, {
        abogado,
        caso,
        descripcion: req.body.sanitizedInput.descripcion,
        fecha_hora_limite,
      });

      await em.flush();
      await em.populate(recordatorio, ["abogado", "caso"]);

      const data = new RecordatorioDTO(recordatorio);
      res.status(201).json({ message: "Recordatorio creado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const recordatorio = await em.findOneOrFail(Recordatorio, { id });

      if (req.body.fecha_hora_limite) {
        const nuevaFecha = new Date(req.body.fecha_hora_limite);
        if (nuevaFecha <= new Date()) {
          res.status(400).json({
            message:
              "La nueva fecha y hora límite deben ser posteriores a la actual.",
          });
          return;
        }
        recordatorio.fecha_hora_limite = nuevaFecha;
      }

      recordatorio.descripcion =
        req.body.descripcion?.trim() || recordatorio.descripcion;

      await em.flush();
      await em.populate(recordatorio, ["abogado", "caso"]);

      const data = new RecordatorioDTO(recordatorio);
      res.status(200).json({ message: "Recordatorio actualizado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const recordatorio = await em.findOneOrFail(Recordatorio, { id });

      await em.removeAndFlush(recordatorio);
      res.status(200).json({ message: "Recordatorio eliminado." });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: Function) => {
    try {
      req.body.sanitizedInput = {
        descripcion: req.body.descripcion
          ? req.body.descripcion.trim()
          : undefined,
        fecha_hora_limite: req.body.fecha_hora_limite
          ? new Date(req.body.fecha_hora_limite)
          : undefined,
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
