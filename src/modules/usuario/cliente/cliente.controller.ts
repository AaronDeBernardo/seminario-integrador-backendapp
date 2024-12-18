import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Cliente } from "./cliente.entity.js";
import { ClienteDTO } from "./cliente.dto.js";
import { Usuario } from "../usuario/usuario.entity.js";

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
      res.status(500).json({ message: error.message });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const cliente = await em.findOneOrFail(
        Cliente,
        {
          usuario: { id },
        },
        { populate: ["usuario"] }
      );

      const data = new ClienteDTO(cliente);

      res.status(200).json({
        message: "El cliente fue encontrado.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const cliente = em.create(Cliente, req.body.sanitizedInput);
      await em.flush();

      const data = new ClienteDTO(cliente);
      res.status(201).json({ message: "Cliente creado.", data });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const cliente = await em.findOneOrFail(
        Cliente,
        { usuario: { id } },
        { populate: ["usuario"] }
      );

      em.assign(cliente, req.body.sanitizedInput, {
        updateByPrimaryKey: false,
      });

      await em.flush();
      const data = new ClienteDTO(cliente);

      res.status(200).json({
        message: "Cliente actualizado.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  sanitize: (req: Request, _res: Response, next: NextFunction) => {
    // llamar antes a sanitizeUsuario
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
  },
};
