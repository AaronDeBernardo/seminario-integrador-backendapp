import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
  validateNumericIdArray,
} from "../../../utils/validators.js";
import { Abogado } from "./abogado.entity.js";
import { AbogadoDTO } from "./abogado.dto.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { usuarioService } from "../usuario/usuario.service.js";

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
        {
          populate: ["abogado", "abogado.rol", "abogado.especialidades"],
          orderBy: { apellido: "ASC", nombre: "ASC" },
        }
      );

      const data = abogados.map((a) => new AbogadoDTO(a, false));

      res
        .status(200)
        .json(new ApiResponse("Todos los abogados fueron encontrados.", data));
    } catch (error: unknown) {
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

      const data = new AbogadoDTO(abogado, true);

      res.status(200).json(new ApiResponse("El abogado fue encontrado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findEspecialidades: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const abogado = await em.findOneOrFail(
        Abogado,
        {
          usuario: { id, fecha_baja: { $eq: null } },
        },
        { populate: ["especialidades"] }
      );

      const especialidades = abogado.especialidades.getItems();

      const data = especialidades
        .map((esp) => ({
          id: esp.id,
          nombre: esp.nombre,
        }))
        .sort((a, b) => {
          if (a.nombre === "Otro") return 1; // 'Otro' va al final
          if (b.nombre === "Otro") return -1;
          return a.nombre.localeCompare(b.nombre);
        });

      res
        .status(200)
        .json(new ApiResponse("Especialidades del abogado encontradas.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAvailable: async (req: Request, res: Response) => {
    try {
      const availableIds: Array<{ id: number }> = await em.execute(
        `
        SELECT us.id
        FROM abogados ab
        INNER JOIN usuarios us
          ON us.id = ab.id_usuario
          AND us.fecha_baja IS NULL
        LEFT JOIN abogados_casos ab_ca
          ON ab_ca.id_abogado = ab.id_usuario
          AND ab_ca.fecha_baja IS NULL
        LEFT JOIN casos ca
          ON ca.id = ab_ca.id_caso
          AND ca.estado = ?
        GROUP BY us.id
        HAVING COUNT(ca.id) < 5;
        `,
        [EstadoCasoEnum.EN_CURSO]
      );

      const ids: number[] = availableIds.map((row) => Number(row.id));

      const abogados = await em.find(
        Usuario,
        {
          id: { $in: ids },
          abogado: { $ne: null },
          fecha_baja: { $eq: null },
        },
        {
          populate: ["abogado", "abogado.rol", "abogado.especialidades"],
        }
      );

      const data = abogados.map((a) => new AbogadoDTO(a, false));

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los abogados disponibles fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAvailableForCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const availableIds: Array<{ id: number }> = await em.execute(
        `
        SELECT us.id
        FROM abogados ab
        INNER JOIN usuarios us
          ON us.id = ab.id_usuario
          AND us.fecha_baja IS NULL
        INNER JOIN abogados_especialidades ab_es1
          ON ab_es1.id_abogado = ab.id_usuario
        LEFT JOIN abogados_casos ab_ca
          ON ab_ca.id_abogado = ab.id_usuario
          AND ab_ca.fecha_baja IS NULL
        LEFT JOIN casos ca
          ON ca.id = ab_ca.id_caso
          AND ca.estado = ?
        WHERE ab_es1.id_especialidad = (SELECT id_especialidad FROM casos WHERE id=?)
          AND us.id NOT IN (SELECT id_abogado FROM abogados_casos WHERE id_caso=? AND fecha_baja IS NULL)
        GROUP BY us.id
        HAVING COUNT(ca.id) < 5;
        `,
        [EstadoCasoEnum.EN_CURSO, id_caso, id_caso]
      );

      const ids: number[] = availableIds.map((row) => Number(row.id));

      const abogados = await em.find(
        Usuario,
        {
          id: { $in: ids },
          abogado: { $ne: null },
          fecha_baja: { $eq: null },
        },
        {
          populate: [
            "abogado.usuario",
            "abogado.rol",
            "abogado.especialidades",
          ],
        }
      );

      const data = abogados.map((a) => new AbogadoDTO(a, false));

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los abogados disponibles para el caso fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  // add, update and sanitize

  add: async (req: Request, res: Response) => {
    try {
      const em = orm.em.fork();
      const abogado = em.create(Abogado, req.body.sanitizedInput);

      if (abogado.especialidades.length === 0)
        throw new HttpError(
          400,
          "El abogado debe tener por lo menos 1 especialidad."
        );

      validateEntity(abogado.usuario);
      validateEntity(abogado);
      await usuarioService.validateUniqueDocumento(abogado.usuario);

      await em.flush();
      const data = new AbogadoDTO(abogado, true);

      res.status(201).json(new ApiResponse("Abogado creado.", data));
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintViolationException) {
        if (error.sqlMessage?.includes("matricula_UNIQUE")) {
          res
            .status(409)
            .send(
              new ApiResponse(
                "Ya existe un abogado con la matrícula ingresada."
              )
            );
          return;
        } else if (error.sqlMessage?.includes("email_UNIQUE")) {
          res
            .status(409)
            .send(
              new ApiResponse("Ya existe un usuario con el email ingresado.")
            );
          return;
        }
      }

      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const em = orm.em.fork();

      const id = validateNumericId(req.params.id, "id");
      const abogado = await em.findOneOrFail(
        Abogado,
        { usuario: { id, fecha_baja: { $eq: null } } },
        { populate: ["usuario", "especialidades:ref"] }
      );

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
      await usuarioService.validateUniqueDocumento(abogado.usuario);

      await em.flush();
      const data = new AbogadoDTO(abogado, true);

      res.status(200).json(new ApiResponse("Abogado actualizado.", data));
    } catch (error: unknown) {
      if (error instanceof UniqueConstraintViolationException) {
        if (error.sqlMessage?.includes("matricula_UNIQUE")) {
          res
            .status(409)
            .send(
              new ApiResponse(
                "Ya existe un abogado con la matrícula ingresada."
              )
            );
          return;
        } else if (error.sqlMessage?.includes("email_UNIQUE")) {
          res
            .status(409)
            .send(
              new ApiResponse("Ya existe un usuario con el email ingresado.")
            );
          return;
        }
      }

      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file?.buffer && req.method !== "PATCH" && req.method !== "PUT")
        throw new HttpError(400, "foto: es requerida.");

      usuarioService.sanitizeUsuario(req);
      req.body.sanitizedInput = {
        ...req.body.sanitizedInput,
        foto: req.file?.buffer,
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
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
