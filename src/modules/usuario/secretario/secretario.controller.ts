import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { Secretario } from "./secretario.entity.js";
import { SecretarioDTO } from "./secretario.dto.js";

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
          usuario: { id },
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
      const usuario = em.create(Usuario, req.body.sanitizedInput);
      const secretario = em.create(Secretario, {
        ...req.body.sanitizedInput,
        usuario: usuario,
      });

      await em.flush();
      const data = new SecretarioDTO(secretario);

      res.status(201).json({ message: "Secretario creado.", data });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const secretario = await em.findOneOrFail(
        Secretario,
        {
          usuario: { id },
        },
        { populate: ["usuario"] }
      );
      em.assign(secretario, req.body.sanitizedInput);
      em.assign(secretario.usuario, req.body.sanitizedInput);

      await em.flush();
      const data = new SecretarioDTO(secretario);

      res.status(200).json({
        message: "Secretario actualizado.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  sanitize: async (req: Request, _res: Response, next: NextFunction) => {
    // llamar antes a sanitizeUsuario
    req.body.sanitizedInput = {
      ...req.body.sanitizedInput,
      turno_trabajo: req.body.turno_trabajo,
    };

    Object.keys(req.body.sanitizedInput).forEach((key) => {
      if (req.body.sanitizedInput[key] === undefined) {
        delete req.body.sanitizedInput[key];
      }
    });

    next();
  },
};
