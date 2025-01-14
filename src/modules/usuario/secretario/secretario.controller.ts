import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { HttpError } from "../../../utils/http-error.js";
import { sanitizeUsuario } from "../usuario/usuario.controller.js";
import { Secretario } from "./secretario.entity.js";
import { SecretarioDTO } from "./secretario.dto.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { validateEntity } from "../../../utils/validators.js";

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
        { populate: ["secretario"] }
      );

      const data = secretarios.map((s) => new SecretarioDTO(s));

      res.status(200).json({
        message: "Todos los secretarios fueron encontrados.",
        data,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const secretario = await em.findOneOrFail(
        Secretario,
        {
          usuario: { id, fecha_baja: { $eq: null } },
        },
        { populate: ["usuario"] }
      );

      const data = new SecretarioDTO(secretario);

      res.status(200).json({
        message: "El secretario fue encontrado.",
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
      const secretario = em.create(Secretario, req.body.sanitizedInput);
      validateEntity(secretario.usuario);
      validateEntity(secretario);

      await em.flush();

      const data = new SecretarioDTO(secretario);
      res.status(201).json({ message: "Secretario creado.", data });
    } catch (error: any) {
      if (error instanceof HttpError) error.send(res);
      else res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

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

      await em.flush();
      const data = new SecretarioDTO(secretario);

      res.status(200).json({
        message: "Secretario actualizado.",
        data,
      });
    } catch (error: any) {
      if (error instanceof HttpError) error.send(res);
      else {
        let errorCode = 500;
        if (error.message.match("not found")) errorCode = 404;
        res.status(errorCode).json({ message: error.message });
      }
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      sanitizeUsuario(req);
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
};
