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
      const now = new Date();
      const noticias = await em.find(Noticia, {
        fecha_vencimiento: { $gt: now.toISOString() },
      });
      const data = noticias.map((n) => new NoticiaDTO(n));

      res.status(200).json({
        message: "Todas las noticias vigentes fueron encontradas.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const noticia = await em.findOneOrFail(Noticia, {
        id,
        fecha_vencimiento: { $gt: new Date().toISOString() },
      });
      const data = new NoticiaDTO(noticia);

      res.status(200).json({
        message: "La noticia vigente fue encontrada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fecha_publicacion, fecha_vencimiento, ...rest } =
        req.body.sanitizedInput;

      const now = new Date();
      const defaultFechaPublicacion = fecha_publicacion
        ? new Date(fecha_publicacion)
        : now;
      const defaultFechaVencimiento = fecha_vencimiento
        ? new Date(fecha_vencimiento)
        : new Date(now.setMonth(now.getMonth() + 1));

      if (defaultFechaPublicacion > defaultFechaVencimiento) {
        res.status(400).json({
          message:
            "La fecha de publicación no puede ser mayor que la fecha de vencimiento.",
        });
        return;
      }

      if (defaultFechaPublicacion < now) {
        res.status(400).json({
          message:
            "La fecha de publicación debe ser mayor o igual a la fecha actual.",
        });
        return;
      }

      if (defaultFechaVencimiento < now) {
        res.status(400).json({
          message:
            "La fecha de vencimiento debe ser mayor o igual a la fecha actual.",
        });
        return;
      }

      const noticia = em.create(Noticia, {
        ...rest,
        fecha_publicacion: defaultFechaPublicacion,
        fecha_vencimiento: defaultFechaVencimiento,
      });

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

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const noticia = await em.findOneOrFail(Noticia, { id });

      if (
        req.body.fecha_publicacion &&
        isNaN(Date.parse(req.body.fecha_publicacion))
      ) {
        res
          .status(400)
          .json({ message: "La fecha de publicación es inválida." });
        return;
      }

      if (
        req.body.fecha_vencimiento &&
        isNaN(Date.parse(req.body.fecha_vencimiento))
      ) {
        res
          .status(400)
          .json({ message: "La fecha de vencimiento es inválida." });
        return;
      }

      const sanitizedInput = {
        titulo: req.body.titulo,
        cuerpo: req.body.cuerpo,
        fecha_publicacion: req.body.fecha_publicacion,
        fecha_vencimiento: req.body.fecha_vencimiento,
      };

      if (!sanitizedInput.fecha_publicacion) {
        res
          .status(400)
          .json({ message: "La fecha de publicación es requerida." });
        return;
      }

      if (!sanitizedInput.fecha_vencimiento) {
        res
          .status(400)
          .json({ message: "La fecha de vencimiento es requerida." });
        return;
      }

      const pubDate = new Date(sanitizedInput.fecha_publicacion);
      const expDate = new Date(sanitizedInput.fecha_vencimiento);

      if (expDate < pubDate) {
        res.status(400).json({
          message:
            "La fecha de vencimiento debe ser posterior a la fecha de publicación.",
        });
        return;
      }

      em.assign(noticia, sanitizedInput);
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

  desactivate: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const noticia = await em.findOneOrFail(Noticia, { id });

      const now = new Date();
      if (
        noticia.fecha_vencimiento &&
        new Date(noticia.fecha_vencimiento) <= now
      ) {
        res.status(400).json({
          message: "La noticia ya está desactivada.",
        });
        return;
      }

      noticia.fecha_vencimiento = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      await em.flush();

      const data = new NoticiaDTO(noticia);
      res.status(200).json({
        message: "La noticia fue desactivada.",
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
        fecha_publicacion: new Date(req.body.fecha_publicacion),
        fecha_vencimiento: new Date(req.body.fecha_vencimiento),
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
