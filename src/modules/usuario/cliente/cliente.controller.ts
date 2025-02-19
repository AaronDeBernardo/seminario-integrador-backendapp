import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Cliente } from "./cliente.entity.js";
import { ClienteDTO } from "./cliente.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { sanitizeUsuario } from "../usuario/usuario.controller.js";
import { Usuario } from "../usuario/usuario.entity.js";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const clientes = await em.find(
        Usuario,
        {
          cliente: { $ne: null },
          fecha_baja: { $eq: null },
        },
        { populate: ["cliente"] }
      );

      const data = clientes.map((c) => new ClienteDTO(c));

      res.status(200).json({
        message: "Todos los clientes fueron encontrados.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const cliente = await em.findOneOrFail(
        Cliente,
        {
          usuario: { id, fecha_baja: { $eq: null } },
        },
        { populate: ["usuario"] }
      );

      const data = new ClienteDTO(cliente);

      res.status(200).json({
        message: "El cliente fue encontrado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const cliente = em.create(Cliente, req.body.sanitizedInput);
      validateEntity(cliente.usuario);
      validateEntity(cliente);

      if (
        (cliente.es_empresa && cliente.usuario.apellido) ||
        (!cliente.es_empresa && !cliente.usuario.apellido)
      )
        throw new HttpError(
          400,
          "Una persona debe tener apellido. En una empresa debe ser null o undefined."
        );

      await em.flush();

      const data = new ClienteDTO(cliente);
      res.status(201).json({ message: "Cliente creado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const cliente = await em.findOneOrFail(
        Cliente,
        { usuario: { id, fecha_baja: { $eq: null } } },
        { populate: ["usuario"] }
      );

      em.assign(cliente, req.body.sanitizedInput, {
        updateByPrimaryKey: false,
      });

      validateEntity(cliente.usuario);
      validateEntity(cliente);

      if (
        (cliente.es_empresa && cliente.usuario.apellido) ||
        (!cliente.es_empresa && !cliente.usuario.apellido)
      )
        throw new HttpError(
          400,
          "Una persona debe tener apellido. En una empresa debe ser null o undefined."
        );

      await em.flush();
      const data = new ClienteDTO(cliente);

      res.status(200).json({
        message: "Cliente actualizado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      sanitizeUsuario(req);
      req.body.sanitizedInput = {
        ...req.body.sanitizedInput,
        es_empresa: req.body.es_empresa,
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
