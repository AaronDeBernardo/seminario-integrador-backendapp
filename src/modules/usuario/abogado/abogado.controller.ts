import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Abogado } from "./abogado.entity.js";
import { AbogadoDTO } from "./abogado.dto.js";
import { Rol } from "../rol/rol.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { validateId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const abogados = await em.find(
        Usuario,
        {
          abogado: { $ne: null },
          fecha_baja: { $eq: null },
        },
        { populate: ["abogado", "abogado.rol"] }
      );

      const data = abogados.map((a) => new AbogadoDTO(a));

      res.status(200).json({
        message: "Todos los abogados fueron encontrados.",
        data,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const abogado = await em.findOneOrFail(
        Abogado,
        {
          usuario: { id },
        },
        { populate: ["usuario", "rol"] }
      );

      const data = new AbogadoDTO(abogado);

      res.status(200).json({
        message: "El abogado fue encontrado.",
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
      const abogado = em.create(Abogado, req.body.sanitizedInput);
      await em.flush();

      const data = new AbogadoDTO(abogado);

      res.status(201).json({ message: "Abogado creado.", data });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const abogado = await em.findOneOrFail(
        Abogado,
        { usuario: { id } },
        { populate: ["usuario"] }
      );

      em.assign(abogado, req.body.sanitizedInput, {
        updateByPrimaryKey: false,
      });

      await em.flush();
      const data = new AbogadoDTO(abogado);

      res.status(200).json({
        message: "Abogado actualizado.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    // llamar antes a sanitizeUsuario
    try {
      req.body.sanitizedInput = {
        ...req.body.sanitizedInput,
        foto: req.body.foto,
        matricula: req.body.matricula?.trim(),
        rol: validateId(req.body.id_rol, "id_rol"),
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
