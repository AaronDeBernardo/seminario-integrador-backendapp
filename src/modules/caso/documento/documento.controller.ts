import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { Documento } from "./documento.entity.js";
import { DocumentoDTO } from "./documento.dto.js";
import { format } from "date-fns";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const documentos = await em.find(
        Documento,
        { fecha_baja: null },
        {
          populate: ["caso.cliente.usuario", "caso.especialidad"],
          fields: [
            "id",
            "nombre",
            "fecha_carga",
            "caso.descripcion",
            "caso.especialidad.nombre",
            "caso.cliente.usuario.id",
            "caso.cliente.usuario.nombre",
            "caso.cliente.usuario.apellido",
          ],
        }
      );

      const data = documentos.map(
        (d) => new DocumentoDTO(d as Documento, true)
      );

      res
        .status(200)
        .json(
          new ApiResponse("Todos los documentos fueron encontrados.", data)
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAllByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const documentos = await em.find(
        Documento,
        { caso: id_caso, fecha_baja: null },
        {
          fields: ["id", "nombre", "fecha_carga"],
        }
      );

      const data = documentos.map(
        (d) => new DocumentoDTO(d as Documento, false)
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los documentos del caso fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const documento = await em.findOneOrFail(Documento, {
        id,
        fecha_baja: null,
      });
      console.log(documento);
      const data = new DocumentoDTO(documento, false);

      res
        .status(200)
        .json(new ApiResponse("El documento fue encontrado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const em = orm.em.fork();
      const documento = em.create(Documento, req.body.sanitizedInput);
      validateEntity(documento);

      await em.flush();

      res.status(201).json(new ApiResponse("Documento guardado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  logicalDelete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const documento = await em.findOneOrFail(
        Documento,
        {
          id,
          fecha_baja: null,
        },
        { fields: ["id", "nombre", "fecha_carga", "fecha_baja"] }
      );

      documento.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      res
        .status(200)
        .json(new ApiResponse("Documento dado de baja.", documento));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        nombre: req.body.nombre?.trim(),
        archivo: req.file,
      };

      if (!req.file) throw new HttpError(400, "archivo: es requerido.");

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
