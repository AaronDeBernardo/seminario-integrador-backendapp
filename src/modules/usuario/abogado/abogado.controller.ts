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
import { Usuario } from "../usuario/usuario.entity.js";
import { usuarioService } from "../usuario/usuario.service.js";

const em = orm.em;
//TODO revisar el otro endpoint q me pidio milton, que no este daod de baka

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

      const data = new AbogadoDTO(abogado);

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

      const data = especialidades.map((esp) => ({
        id: esp.id,
        nombre: esp.nombre,
      }));

      res
        .status(200)
        .json(new ApiResponse("Especialidades del abogado encontradas.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAvailable: async (req: Request, res: Response) => {
    try {
      const abogados = await em.execute(
        `
        SELECT us.id, us.nombre, us.apellido
	        , ab.matricula, ab.foto, COUNT(ca.id) cantidad_casos
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
        HAVING cantidad_casos < 5;
        `,
        [EstadoCasoEnum.EN_CURSO]
      );

      const data = abogados.map((a) => {
        return {
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          matricula: a.matricula,
          foto: a.foto,
        };
      });

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

      const abogados = await em.execute(
        `
        SELECT us.id, us.nombre, us.apellido
	        , ab.matricula, ab.foto, COUNT(ca.id) cantidad_casos
        FROM abogados ab
        INNER JOIN usuarios us
          ON us.id = ab.id_usuario
          AND us.fecha_baja IS NULL
        INNER JOIN abogados_especialidades ab_es
          ON ab_es.id_abogado = ab.id_usuario
        LEFT JOIN abogados_casos ab_ca
	        ON ab_ca.id_abogado = ab.id_usuario
          AND ab_ca.fecha_baja IS NULL
        LEFT JOIN casos ca
	        ON ca.id = ab_ca.id_caso
          AND ca.estado = ?
        WHERE ab_es.id_especialidad = (SELECT id_especialidad FROM casos WHERE id=?)
          AND us.id NOT IN (SELECT id_abogado FROM abogados_casos WHERE id_caso=? AND fecha_baja IS NULL)
        GROUP BY us.id
        HAVING cantidad_casos < 5;
        `,
        [EstadoCasoEnum.EN_CURSO, id_caso, id_caso]
      );

      const data = abogados.map((a) => {
        return {
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          matricula: a.matricula,
          foto: a.foto,
        };
      });

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

      res.status(201).json(new ApiResponse("Abogado creado.", data));
    } catch (error: unknown) {
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

      res.status(200).json(new ApiResponse("Abogado actualizado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      usuarioService.sanitizeUsuario(req);
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
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
