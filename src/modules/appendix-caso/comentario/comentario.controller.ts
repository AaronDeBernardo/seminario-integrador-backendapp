import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { abogadoCasoService } from "../abogado-caso/abogado-caso.service.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { casoService } from "../../caso/caso/caso.service.js";
import { Comentario } from "./comentario.entity.js";
import { ComentarioDTO } from "./comentario.dto.js";
import { comentarioService } from "./comentario.service.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const controller = {
  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      if (req.usuario!.is_admin === false)
        await abogadoCasoService.checkAbogadoWorkingOnCaso(
          req.usuario!.id,
          id_caso,
          false
        );

      const comentarios = await em.find(
        Comentario,
        { caso: id_caso },
        { populate: ["abogado.usuario", "padre"] }
      );

      const data = comentarioService.makeCommentsTree(comentarios);

      res
        .status(200)
        .json(new ApiResponse("Comentarios del caso encontrados.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  addOrReply: async (req: Request, res: Response) => {
    try {
      if (req.usuario!.is_admin === false)
        await abogadoCasoService.checkAbogadoWorkingOnCaso(
          req.usuario!.id,
          req.body.sanitizedInput.caso,
          false
        );

      if (req.params.id_padre) {
        req.body.sanitizedInput.padre = validateNumericId(
          req.params.id_padre,
          "id_padre"
        );
      }

      await casoService.checkCasoIsActive(req.body.sanitizedInput.caso);

      const comentario = em.create(Comentario, req.body.sanitizedInput);
      validateEntity(comentario);
      await em.flush();

      res
        .status(201)
        .json(
          new ApiResponse(
            req.body.sanitizedInput.padre
              ? "Respuesta creada."
              : "Comentario creado.",
            new ComentarioDTO(comentario)
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const comentario = await em.findOneOrFail(Comentario, {
        id,
        abogado: { usuario: req.usuario!.id },
      });

      if (req.usuario!.is_admin === false)
        await abogadoCasoService.checkAbogadoWorkingOnCaso(
          req.usuario!.id,
          comentario.caso.id,
          false
        );

      await casoService.checkCasoIsActive(comentario.caso.id);

      const horasTranscurridas =
        (new Date().getTime() - comentario.fecha_hora.getTime()) /
        (1000 * 60 * 60);

      if (horasTranscurridas > 24) {
        res
          .status(403)
          .json(
            new ApiResponse(
              "No se puede eliminar el comentario después de 24 horas."
            )
          );
        return;
      }

      await em.removeAndFlush(comentario);
      res.status(200).json(new ApiResponse("Comentario eliminado."));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        abogado: req.usuario!.id,
        comentario: req.body.comentario?.trim(),
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
