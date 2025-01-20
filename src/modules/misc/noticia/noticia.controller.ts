import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Noticia } from "./noticia.entity.js";
import { NoticiaDTO } from "./noticia.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const noticias = await em.findAll(Noticia);
      const data = noticias.map((n) => new NoticiaDTO(n));

      res.status(200).json({
        message: "Todas las noticias fueron encontradas.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const noticia = await em.findOneOrFail(Noticia, { id });
      const data = new NoticiaDTO(noticia);

      res.status(200).json({
        message: "La noticia fue encontrada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const noticia = em.create(Noticia, req.body.sanitizedInput);
      validateEntity(noticia);
      await em.flush();

      const data = new NoticiaDTO(noticia);
      res.status(201).json({
        message: "La noticia fue creada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const noticia = await em.findOneOrFail(Noticia, { id });

      em.assign(noticia, req.body.sanitizedInput);
      validateEntity(noticia);
      await em.flush();

      const data = new NoticiaDTO(noticia);
      res.status(200).json({
        message: "La noticia fue actualizada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        titulo: req.body.titulo?.trim(),
        cuerpo: req.body.cuerpo?.trim(),
        fecha_publicacion: req.body.fecha_publicacion
          ? new Date(req.body.fecha_publicacion)
          : undefined,
        fecha_vencimiento: req.body.fecha_vencimiento
          ? new Date(req.body.fecha_vencimiento)
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
