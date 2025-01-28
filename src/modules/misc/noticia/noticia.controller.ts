import { addDays, format } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { handleError } from "../../../utils/error-handler.js";
import { Noticia } from "./noticia.entity.js";
import { NoticiaDTO } from "./noticia.dto.js";
import { orm } from "../../../config/db.config.js";
import {
  validateDate,
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const noticias = await em.find(Noticia, {
        fecha_vencimiento: { $gt: today },
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
      const today = format(new Date(), "yyyy-MM-dd");
      const id = validateNumericId(req.params.id, "id");

      const noticia = await em.findOneOrFail(Noticia, {
        id,
        fecha_vencimiento: { $gt: today },
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

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const input = req.body.sanitizedInput;
      const today = format(new Date(), "yyyy-MM-dd");

      if (input.fecha_publicacion === undefined)
        input.fecha_publicacion = today;

      if (input.fecha_vencimiento === undefined)
        input.fecha_vencimiento = format(
          addDays(input.fecha_publicacion, 31),
          "yyyy-MM-dd"
        );

      if (input.fecha_publicacion >= input.fecha_vencimiento) {
        res.status(400).json({
          message:
            "La fecha de publicación no puede ser mayor o igual a la fecha de vencimiento.",
        });
        return;
      }

      if (input.fecha_publicacion < today) {
        res.status(400).json({
          message:
            "La fecha de publicación debe ser mayor o igual a la fecha actual.",
        });
        return;
      }

      const noticia = em.create(Noticia, input);

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
      const noticia = await em.findOneOrFail(Noticia, id);

      const input = req.body.sanitizedInput;
      const today = format(new Date(), "yyyy-MM-dd");

      if (
        input.fecha_publicacion !== undefined &&
        input.fecha_publicacion !== noticia.fecha_publicacion &&
        input.fecha_publicacion < today
      ) {
        res.status(400).json({
          message:
            "La fecha de publicación debe ser mayor o igual a la fecha actual, o no modificarse.",
        });
        return;
      }

      em.assign(noticia, req.body.sanitizedInput);

      if (noticia.fecha_publicacion >= noticia.fecha_vencimiento) {
        res.status(400).json({
          message:
            "La fecha de publicación no puede ser mayor o igual a la fecha de vencimiento.",
        });
        return;
      }

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

  deactivate: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const noticia = await em.findOneOrFail(Noticia, { id });

      const now = new Date();
      if (
        noticia.fecha_vencimiento &&
        new Date(noticia.fecha_vencimiento) <= now
      ) {
        res.status(400).json({
          message: "La noticia ya está dada de baja.",
        });
        return;
      }

      noticia.fecha_vencimiento = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      const data = new NoticiaDTO(noticia);
      res.status(200).json({
        message: "La noticia fue dada de baja.",
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

        fecha_publicacion: validateDate(
          req.body.fecha_publicacion,
          "fecha_publicacion"
        ),

        fecha_vencimiento: validateDate(
          req.body.fecha_vencimiento,
          "fecha_vencimiento"
        ),
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
