import { format } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { Documento } from "./documento.entity.js";
import { DocumentoDTO } from "./documento.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { politicasService } from "../../misc/politicas/politicas.service.js";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";

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

      res.status(200).json({
        message: "Todos los documentos fueron encontrados.",
        data,
      });
    } catch (error: any) {
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

      res.status(200).json({
        message: "Todos los documentos del caso fueron encontrados.",
        data,
      });
    } catch (error: any) {
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

      res.status(200).json({
        message: "El documento fue encontrado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const { nombre, archivo } = req.body.sanitizedInput;

      const politica = await em.findOneOrFail(Politica, {});
      const MAX_FILE_SIZE = politica.tam_max_archivo_mb * 1024 * 1024;

      if (!archivo) {
        res.status(400).json({
          message: "El archivo es requerido",
        });
        return;
      }

      if (!nombre) {
        res.status(400).json({
          message: "El nombre es requerido",
        });
        return;
      }

      const buffer = Buffer.from(archivo, "base64");
      const fileSize = buffer.length;

      if (fileSize > MAX_FILE_SIZE) {
        res.status(400).json({
          message: `El archivo excede el tamaño máximo permitido (${politica.tam_max_archivo_mb}MB)`,
        });
        return;
      }

      const caso = await em.findOneOrFail(Caso, { id: id_caso });

      const documentoData = {
        caso,
        nombre,
        archivo: buffer,
        fecha_carga: new Date().toISOString().split("T")[0],
      };

      const documento = em.create(Documento, documentoData);
      validateEntity(documento);

      await em.flush();
      await em.populate(documento, ["caso"]);

      const data = new DocumentoDTO(documento);

      res.status(201).json({
        message: "Documento creado.",
        data,
      });
    } catch (error: any) {
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

      res.status(200).json({
        message: "Documento dado de baja.",
        data: documento,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      const sanitizedInput: any = {};

      if (req.body.nombre) {
        sanitizedInput.nombre = req.body.nombre.trim();
      }

      if (req.body.archivo) {
        sanitizedInput.archivo = req.body.archivo;
      }

      req.body.sanitizedInput = sanitizedInput;
      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
