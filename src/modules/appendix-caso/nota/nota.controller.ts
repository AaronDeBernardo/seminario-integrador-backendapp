import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { Nota } from "./nota.entity.js";
import { NotaDTO } from "./nota.dto.js";
import { Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { handleError } from "../../../utils/error-handler.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const notas = await em.find(Nota, {}, { populate: ["abogado", "caso"] });
      const data = notas.map((nota) => new NotaDTO(nota));
      res.status(200).json({ message: "Notas encontradas.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const notas = await em.find(
        Nota,
        { caso: id_caso },
        { populate: ["abogado", "caso"] }
      );
      const data = notas.map((nota) => new NotaDTO(nota));
      res.status(200).json({ message: "Notas del caso encontradas.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");

      const caso = await em.findOneOrFail(Caso, { id: id_caso });
      const abogado = await em.findOneOrFail(Abogado, { usuario: id_abogado });

      const fecha_hora = new Date();

      const notaExistente = await em.findOne(Nota, {
        caso: id_caso,
        abogado: id_abogado,
        fecha_hora: fecha_hora,
      });

      if (notaExistente) {
        res.status(400).json({
          message: "Ya existe una nota con la misma clave primaria.",
        });
        return;
      }

      const nota = em.create(Nota, {
        abogado,
        caso,
        titulo: req.body.sanitizedInput.titulo,
        descripcion: req.body.sanitizedInput.descripcion,
        fecha_hora: fecha_hora,
      });

      await em.flush();
      await em.populate(nota, ["abogado", "caso"]);

      const data = new NotaDTO(nota);
      res.status(201).json({ message: "Nota creada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const fecha_hora = new Date(req.params.fecha_hora);

      const nota = await em.findOneOrFail(Nota, {
        caso: id_caso,
        abogado: id_abogado,
        fecha_hora: fecha_hora,
      });

      nota.titulo = req.body.sanitizedInput.titulo || nota.titulo;
      nota.descripcion =
        req.body.sanitizedInput.descripcion || nota.descripcion;

      await em.flush();
      await em.populate(nota, ["abogado", "caso"]);

      const data = new NotaDTO(nota);
      res.status(200).json({ message: "Nota actualizada.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");
      const fecha_hora = new Date(req.params.fecha_hora);

      const nota = await em.findOneOrFail(Nota, {
        caso: id_caso,
        abogado: id_abogado,
        fecha_hora: fecha_hora,
      });

      const horasTranscurridas =
        (new Date().getTime() - nota.fecha_hora.getTime()) / (1000 * 60 * 60);

      if (horasTranscurridas > 2) {
        res.status(403).json({
          message:
            "No se puede eliminar la nota después de 2 horas de su creación.",
        });
        return;
      }

      await em.removeAndFlush(nota);
      res.status(200).json({ message: "Nota eliminada." });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: Function) => {
    try {
      req.body.sanitizedInput = {
        titulo: req.body.titulo ? req.body.titulo.trim() : undefined,
        descripcion: req.body.descripcion
          ? req.body.descripcion.trim()
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
