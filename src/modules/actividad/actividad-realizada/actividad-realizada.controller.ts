import { NextFunction, Request, Response } from "express";
import { subDays, subMonths } from "date-fns";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Actividad } from "../actividad/actividad.entity.js";
import { ActividadRealizada } from "./actividad-realizada.entity.js";
import { ActividadRealizadaDTO } from "./actividad-realizada.dto.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { Cliente } from "../../usuario/cliente/cliente.entity.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { QueryOrder } from "@mikro-orm/core";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const limitDay = subMonths(new Date(), 2);
      const actividadesRealizadas = await em.find(
        ActividadRealizada,
        {
          fecha_hora: { $gte: limitDay },
        },
        { populate: ["actividad", "abogado.usuario", "cliente.usuario"] }
      );

      const data = actividadesRealizadas.map(
        (a) => new ActividadRealizadaDTO(a, true)
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Actividades realizadas en los últimos 60 días.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findByAbogado: async (req: Request, res: Response) => {
    try {
      const idAbogado = validateNumericId(req.params.id, "id");

      const actividadesRealizadas = await em.find(
        ActividadRealizada,
        {
          abogado: { usuario: idAbogado },
        },
        {
          orderBy: { fecha_hora: QueryOrder.DESC },
          limit: 50,
          populate: ["actividad", "abogado.usuario", "cliente.usuario"],
        }
      );

      const data = actividadesRealizadas.map(
        (a) => new ActividadRealizadaDTO(a, false)
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            "Últimas 50 actividades realizadas por el abogado.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const ar = em.create(ActividadRealizada, req.body.sanitizedInput);
      await validateEntitiesActive(ar);

      await em.flush();
      await em.refresh(ar);

      const data = new ActividadRealizadaDTO(ar, true);
      res
        .status(201)
        .json(new ApiResponse("Se registró la actividad realizada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const ar = await em.findOneOrFail(ActividadRealizada, id);
      em.assign(ar, req.body.sanitizedInput);

      await validateEntitiesActive(ar);
      await em.flush();

      const data = new ActividadRealizadaDTO(ar, true);
      res
        .status(200)
        .json(new ApiResponse("Se actualizó la actividad realizada.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const ar = await em.findOneOrFail(ActividadRealizada, id);

      if (ar.fecha_hora < subDays(new Date(), 1)) {
        throw new HttpError(
          400,
          "Las actividades realizadas no se pueden eliminar luego de 24 horas."
        );
      }

      await em.removeAndFlush(ar);
      res
        .status(200)
        .json(new ApiResponse("Se eliminó la actividad realizada.", ar));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize(req: Request, res: Response, next: NextFunction) {
    try {
      req.body.sanitizedInput = {
        actividad: validateNumericId(req.body.id_actividad, "id_actividad"),
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        cliente: validateNumericId(req.body.id_cliente, "id_cliente"),
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

async function validateEntitiesActive(ar: ActividadRealizada) {
  await em.findOneOrFail(Actividad, {
    $eq: ar.actividad,
    fecha_baja: { $eq: null },
  });

  await em.findOneOrFail(Abogado, {
    usuario: {
      id: ar.abogado.usuario.id,
      fecha_baja: { $eq: null },
    },
  });

  await em.findOneOrFail(Cliente, {
    usuario: {
      id: ar.cliente.usuario.id,
      fecha_baja: { $eq: null },
    },
  });
}
