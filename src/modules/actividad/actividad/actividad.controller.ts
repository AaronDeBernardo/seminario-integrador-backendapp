import { NextFunction, Request, Response } from "express";
import {
  validateEntity,
  validateNumericId,
  validatePrice,
} from "../../../utils/validators.js";
import { Actividad } from "./actividad.entity.js";
import { ActividadDTO } from "./actividad.dto.js";
import { CostoActividad } from "../costo-actividad/costo-actividad.entity.js";
import { format } from "date-fns";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const results = await em.execute(`
        CALL get_actividades();
      `);

      const data = results[0].map((a: any) => {
        return ActividadDTO.fromGetActividades(a);
      });

      res.status(200).json({
        message: "Todas las actividades activas fueron encontradas.",
        data,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const actividadExistente = await em.findOne(Actividad, {
        nombre: req.body.sanitizedInput.nombre,
        fecha_baja: null,
      });

      if (actividadExistente) {
        res.status(409).json({
          message: "Ya existe una actividad con el mismo nombre.",
          data: actividadExistente,
        });
        return;
      }

      const actividad = em.create(Actividad, req.body.sanitizedInput);
      const costoActividad = em.create(CostoActividad, req.body.sanitizedInput);
      costoActividad.actividad = actividad;

      validateEntity(actividad);

      await em.flush();
      const data = ActividadDTO.fromActividadAndCosto(
        actividad,
        costoActividad
      );

      res.status(201).json({
        message: "Actividad creada.",
        data,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const input = req.body.sanitizedInput;

      const actividad = await em.findOneOrFail(Actividad, {
        id,
        fecha_baja: { $eq: null },
      });

      if (input.nombre && actividad.nombre !== input.nombre) {
        const actividadExistente = await em.findOne(Actividad, {
          nombre: input.nombre,
          fecha_baja: null,
        });

        if (actividadExistente) {
          res.status(409).json({
            message: "Ya existe una actividad con el mismo nombre.",
            data: actividadExistente,
          });
          return;
        }
      }

      em.assign(actividad, input);

      const results = await em.execute<{ cant_jus: string }[]>(
        `
        SELECT get_cant_jus_actividad(?, NOW()) AS cant_jus
        `,
        [id]
      );

      const cant_jus_actual = Number(results[0].cant_jus);
      let data = ActividadDTO.fromActividadAndCantJus(
        actividad,
        cant_jus_actual
      );

      if (cant_jus_actual !== input.cant_jus) {
        const costo = em.create(CostoActividad, input);
        costo.actividad = actividad;
        data = ActividadDTO.fromActividadAndCosto(actividad, costo);
      }

      validateEntity(actividad);
      await em.flush();

      res.status(200).json({
        message: "Actividad actualizada.",
        data,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const actividad = await em.findOneOrFail(Actividad, {
        id,
        fecha_baja: { $eq: null },
      });

      actividad.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      res.status(200).json({
        message: "Actividad dada de baja.",
        data: actividad,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        nombre: req.body.nombre?.trim(),
        cant_jus: validatePrice(req.body.cant_jus, 3, "cant_jus", true, true),
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
