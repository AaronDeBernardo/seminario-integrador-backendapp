import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Abogado } from "./abogado.entity.js";
import { AbogadoDTO } from "./abogado.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import { sanitizeUsuario } from "../usuario/usuario.controller.js";
import { Usuario } from "../usuario/usuario.entity.js";
import {
  validateEntity,
  validateNumericId,
  validateNumericIdArray,
} from "../../../utils/validators.js";
import { HttpError } from "../../../utils/http-error.js";

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
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const abogado = await em.findOneOrFail(
        Abogado,
        {
          usuario: { id, fecha_baja: { $eq: null } },
        },
        { populate: ["usuario", "rol"] }
      );

      const data = new AbogadoDTO(abogado);

      res.status(200).json({
        message: "El abogado fue encontrado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const abogado = em.create(Abogado, req.body.sanitizedInput);

      if (abogado.especialidades.length === 0)
        throw new HttpError(
          400,
          "El abogado debe tener por lo menos 1 especialidad."
        );

      validateEntity(abogado.usuario);
      validateEntity(abogado);

      await em.flush();
      const data = new AbogadoDTO(abogado);

      res.status(201).json({ message: "Abogado creado.", data });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const abogado = await em.findOneOrFail(
        Abogado,
        { usuario: { id, fecha_baja: { $eq: null } } },
        { populate: ["usuario", "especialidades:ref"] }
      );
      console.log(abogado);
      em.assign(abogado, req.body.sanitizedInput, {
        updateByPrimaryKey: false,
      });

      if (abogado.especialidades.length === 0)
        throw new HttpError(
          400,
          "El abogado debe tener por lo menos 1 especialidad."
        );

      validateEntity(abogado.usuario);
      validateEntity(abogado);

      await em.flush();
      const data = new AbogadoDTO(abogado);

      res.status(200).json({
        message: "Abogado actualizado.",
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
        foto: req.body.foto,
        matricula: req.body.matricula?.trim(),
        rol: validateNumericId(req.body.id_rol, "id_rol"),
        especialidades: validateNumericIdArray(
          req.body.especialidades,
          "especialidades"
        ),
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
