import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { AbogadoCaso } from "../abogado-caso/abogado-caso.entity.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { differenceInHours } from "date-fns";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { handleError } from "../../../utils/error-handler.js";
import { Nota } from "./nota.entity.js";
import { NotaDTO } from "./nota.dto.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const notas = await em.findAll(Nota, {
        populate: ["abogado.usuario", "caso.cliente.usuario"],
      });
      const data = notas.map((nota) => new NotaDTO(nota));

      res.status(200).json(new ApiResponse("Notas encontradas.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const notas = await em.find(
        Nota,
        { caso: id_caso },
        { populate: ["abogado.usuario"] }
      );

      const data = notas.map((nota) => new NotaDTO(nota));

      res
        .status(200)
        .json(new ApiResponse("Notas del caso encontradas.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      await em.findOneOrFail(AbogadoCaso, {
        caso: {
          id: req.body.sanitizedInput.caso,
          estado: EstadoCasoEnum.EN_CURSO,
        },
        abogado: { usuario: req.body.sanitizedInput.abogado },
        fecha_baja: { $eq: null },
      });

      const nota = em.create(Nota, req.body.sanitizedInput);
      validateEntity(nota);

      await em.flush();
      await em.refresh(nota);

      const data = new NotaDTO(nota);
      res.status(201).json(new ApiResponse("Nota creada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const nota = await em.findOneOrFail(Nota, {
        id,
        abogado: req.body.sanitizedInput.abogado,
      });

      const horasTranscurridas = differenceInHours(new Date(), nota.fecha_hora);

      if (horasTranscurridas > 2) {
        res
          .status(403)
          .json(
            new ApiResponse(
              "No se puede actualizar la nota después de 2 horas de su creación."
            )
          );
        return;
      }

      nota.titulo = req.body.sanitizedInput.titulo || nota.titulo;
      nota.descripcion =
        req.body.sanitizedInput.descripcion || nota.descripcion;

      validateEntity(nota);
      await em.flush();

      const data = new NotaDTO(nota);
      res.status(200).json(new ApiResponse("Nota actualizada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const nota = await em.findOneOrFail(Nota, {
        id,
      });

      const horasTranscurridas = differenceInHours(new Date(), nota.fecha_hora);

      if (horasTranscurridas > 2) {
        res
          .status(403)
          .json(
            new ApiResponse(
              "No se puede eliminar la nota después de 2 horas de su creación."
            )
          );
        return;
      }

      await em.removeAndFlush(nota);
      res.status(200).json(new ApiResponse("Nota eliminada."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        titulo: req.body.titulo?.trim(),
        descripcion: req.body.descripcion?.trim(),
      };

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
