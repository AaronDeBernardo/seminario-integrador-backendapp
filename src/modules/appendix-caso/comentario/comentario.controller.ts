import { AbogadoCaso } from "../abogado-caso/abogado-caso.entity.js";
import { EstadoCasoEnum } from "../../caso/caso/caso.entity.js";
import { Comentario } from "./comentario.entity.js";
import { ComentarioDTO } from "./comentario.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { Request, Response, NextFunction } from "express";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const comentarios = await em.find(
        Comentario,
        { caso: id_caso },
        { populate: ["caso", "abogado.usuario", "padre", "respuestas"] }
      );

      const data = comentarios.map((c) => new ComentarioDTO(c));

      res.status(200).json({
        message: "Comentarios del caso encontrados.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  addOrReply: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.body.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.body.id_abogado, "id_abogado");

      const abogadoCaso = await em.findOneOrFail(
        AbogadoCaso,
        {
          caso: { id: id_caso, estado: EstadoCasoEnum.EN_CURSO },
          abogado: { usuario: id_abogado },
          fecha_baja: { $eq: null },
        },
        { populate: ["abogado.usuario", "caso"] }
      );

      const caso = abogadoCaso.caso;
      const abogado = abogadoCaso.abogado;

      let padre: Comentario | undefined = undefined;
      if (req.params.id) {
        const id_comentario_padre = validateNumericId(req.params.id, "id");
        padre = await em.findOneOrFail(Comentario, { id: id_comentario_padre });
      }

      const comentario = em.create(Comentario, {
        caso,
        abogado,
        padre,
        comentario: req.body.sanitizedInput.comentario,
        fecha_hora: new Date(),
      });

      validateEntity(comentario);

      await em.flush();
      await em.populate(comentario, ["caso", "abogado", "padre", "respuestas"]);

      res.status(201).json({
        message: padre ? "Respuesta creada." : "Comentario creado.",
        data: new ComentarioDTO(comentario),
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const comentario = await em.findOneOrFail(Comentario, { id });
      const horasTranscurridas =
        (new Date().getTime() - comentario.fecha_hora.getTime()) /
        (1000 * 60 * 60);

      if (horasTranscurridas > 24) {
        res.status(403).json({
          message: "No se puede eliminar el comentario después de 24 horas.",
        });
        return;
      }

      await em.removeAndFlush(comentario);
      res.status(200).json({ message: "Comentario eliminado." });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        comentario: req.body.comentario?.trim(),
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
