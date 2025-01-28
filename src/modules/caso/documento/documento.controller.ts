import { Caso } from "../caso/caso.entity.js";
import { Documento } from "./documento.entity.js";
import { DocumentoDTO } from "./documento.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Politica } from "../../misc/politica/politica.entity.js";
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
        { populate: ["caso"] }
      );

      console.log("Cantidad de documentos encontrados:", documentos.length);
      console.log(
        "Documentos:",
        documentos.map((d) => ({ id: d.id, nombre: d.nombre }))
      );

      const data = documentos.map((d) => new DocumentoDTO(d));

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
        {
          caso: id_caso,
          fecha_baja: null,
        },
        { populate: ["caso"] }
      );

      const data = documentos.map((d) => new DocumentoDTO(d));

      res.status(200).json({
        message: "Documentos del caso encontrados.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const documento = await em.findOneOrFail(
        Documento,
        {
          id,
          caso: id_caso,
          fecha_baja: null,
        },
        { populate: ["caso"] }
      );

      const data = new DocumentoDTO(documento);

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

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const documento = await em.findOneOrFail(Documento, {
        id,
        caso: id_caso,
        fecha_baja: null,
      });

      documento.fecha_baja = new Date().toISOString().split("T")[0];

      await em.flush();
      await em.populate(documento, ["caso"]);

      const data = new DocumentoDTO(documento);

      res.status(200).json({
        message: "Documento dado de baja.",
        data,
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
