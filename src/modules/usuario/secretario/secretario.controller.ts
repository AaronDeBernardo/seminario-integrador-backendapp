import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { Secretario } from "./secretario.entity.js";
import { SecretarioDTO } from "./secretario.dto.js";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { usuarioService } from "../usuario/usuario.service.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const secretarios = await em.find(
        Usuario,
        {
          secretario: { $ne: null },
          fecha_baja: { $eq: null },
        },
        {
          populate: ["secretario"],
          orderBy: { apellido: "ASC", nombre: "ASC" },
        }
      );

      const data = secretarios.map((s) => new SecretarioDTO(s));

      res
        .status(200)
        .json(
          new ApiResponse("Todos los secretarios fueron encontrados.", data)
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const secretario = await em.findOneOrFail(
        Secretario,
        {
          usuario: { id, fecha_baja: { $eq: null } },
        },
        { populate: ["usuario"] }
      );

      const data = new SecretarioDTO(secretario);

      res
        .status(200)
        .json(new ApiResponse("El secretario fue encontrado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const secretario = em.create(Secretario, req.body.sanitizedInput);

      validateEntity(secretario.usuario);
      validateEntity(secretario);
      await usuarioService.validateUniqueDocumento(secretario.usuario);

      await em.flush();

      const data = new SecretarioDTO(secretario);
      res.status(201).json(new ApiResponse("Secretario creado.", data));
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintViolationException) {
        res
          .status(409)
          .send(
            new ApiResponse("Ya existe un usuario con el email ingresado.")
          );
      } else {
        handleError(error, res);
      }
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const secretario = await em.findOneOrFail(
        Secretario,
        {
          usuario: { id, fecha_baja: { $eq: null } },
        },
        { populate: ["usuario"] }
      );

      em.assign(secretario, req.body.sanitizedInput, {
        updateByPrimaryKey: false,
      });

      validateEntity(secretario.usuario);
      validateEntity(secretario);
      await usuarioService.validateUniqueDocumento(secretario.usuario);

      await em.flush();
      const data = new SecretarioDTO(secretario);

      res.status(200).json(new ApiResponse("Secretario actualizado.", data));
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintViolationException) {
        res
          .status(409)
          .send(
            new ApiResponse("Ya existe un usuario con el email ingresado.")
          );
      } else {
        handleError(error, res);
      }
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      usuarioService.sanitizeUsuario(req);
      req.body.sanitizedInput = {
        ...req.body.sanitizedInput,
        turno_trabajo: req.body.turno_trabajo?.trim(),
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
