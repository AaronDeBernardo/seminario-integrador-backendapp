import { format } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { orm } from "../../config/db.config.js";
import { Actividad } from "./actividad.entity.js";
import { ActividadDTO } from "./actividad.dto.js";
import { CostoActividad } from "./costo-actividad.entity.js";
import { HttpError } from "../../utils/http-error.js";
import { validatePrice } from "../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (req: Request, res: Response) => {
    try {
      const results = await em.execute<ActividadDTO[]>(`
        CALL get_actividades();
      `); //TODO ver si demora mucho - no me devuelve según tipos de datos DTO

      res.status(200).json({
        message: "Todas las actividades activas fueron encontradas.",
        data: results[0],
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const actividad = em.create(Actividad, req.body.sanitizedInput);
      const costoActividad = em.create(CostoActividad, req.body.sanitizedInput);
      costoActividad.actividad = actividad;

      await em.flush();
      const data = new ActividadDTO(actividad, costoActividad);

      res.status(201).json({
        message: "Actividad creada.",
        data,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const input = req.body.sanitizedInput;

      const actividad = await em.findOneOrFail(Actividad, id);
      em.assign(actividad, input);

      const results = await em.execute<{ costo_actual: number }[]>(
        `
        SELECT get_costo_actividad(?, NOW()) AS costo_actual
        `,
        [id]
      );

      let costo = new CostoActividad();
      costo.cant_jus = Number(results[0].costo_actual);

      if (costo.cant_jus !== input.cant_jus) {
        costo = em.create(CostoActividad, input);
        costo.actividad = actividad;
      }
      await em.flush();

      const data = new ActividadDTO(actividad, costo);

      res.status(200).json({
        message: "Actividad actualizada.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const actividad = await em.findOneOrFail(Actividad, id);
      if (actividad.fecha_baja)
        throw new HttpError(403, "La actividad ya se encuentra dada de baja.");

      actividad.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      res.status(200).json({
        message: "Actividad dada de baja.",
        data: actividad,
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
      req.body.sanitizedInput = {
        nombre: req.body.nombre?.trim(), //TODO falta validar que no sea empty
        cant_jus: validatePrice(req.body.cant_jus, "cant_jus"), //TODO máx 3 decimales
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
