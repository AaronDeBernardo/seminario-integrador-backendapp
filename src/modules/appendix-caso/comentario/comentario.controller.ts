import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { Comentario } from "./comentario.entity.js";
import { ComentarioDTO } from "./comentario.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { Request, Response, NextFunction } from "express";
import { orm } from "../../../config/db.config.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const comentarios = await em.find(
        Comentario,
        { caso: id_caso },
        { populate: ["caso", "abogado", "padre", "respuestas"] }
      );

      const data = comentarios.map((c) => new ComentarioDTO(c));

      res.status(200).json({
        message: "Comentarios encontrados.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");

      const caso = await em.findOneOrFail(Caso, { id: id_caso });
      const abogado = await em.findOneOrFail(Abogado, {
        usuario: id_abogado,
      });

      const comentario = em.create(Comentario, {
        caso,
        abogado,
        comentario: req.body.sanitizedInput.comentario,
        fecha_hora: new Date(),
      });

      await em.flush();
      await em.populate(comentario, ["caso", "abogado", "padre", "respuestas"]);

      const data = new ComentarioDTO(comentario);

      res.status(201).json({
        message: "Comentario creado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  reply: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const id_comentario_padre = validateNumericId(req.params.id, "id");

      const caso = await em.findOneOrFail(Caso, { id: id_caso });
      const abogado = await em.findOneOrFail(Abogado, { usuario: id_abogado });
      const comentario_padre = await em.findOneOrFail(Comentario, {
        id: id_comentario_padre,
      });

      const respuesta = em.create(Comentario, {
        caso,
        abogado,
        padre: comentario_padre,
        comentario: req.body.sanitizedInput.comentario,
        fecha_hora: new Date(),
      });

      await em.flush();
      await em.populate(respuesta, ["caso", "abogado", "padre", "respuestas"]);

      const data = new ComentarioDTO(respuesta);

      res.status(201).json({
        message: "Respuesta creada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const id = validateNumericId(req.params.id, "id");

      const comentario = await em.findOneOrFail(Comentario, {
        id,
        caso: id_caso,
        abogado: id_abogado,
      });

      const horasTranscurridas =
        (new Date().getTime() - comentario.fecha_hora.getTime()) /
        (1000 * 60 * 60);

      if (horasTranscurridas > 24) {
        res.status(403).json({
          message: "No se puede eliminar el comentario después de 24 horas",
        });
      }

      await em.removeAndFlush(comentario);

      res.status(200).json({
        message: "Comentario eliminado.",
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        comentario: req.body.comentario
          ? req.body.comentario.trim()
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
