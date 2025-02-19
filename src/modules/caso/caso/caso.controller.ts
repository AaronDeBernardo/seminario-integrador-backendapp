import {
  addDays,
  addHours,
  addMonths,
  addYears,
  format,
  subMonths,
} from "date-fns";
import { NextFunction, Request, Response } from "express";
import { Caso } from "./caso.entity.js";
import { CasoDTO } from "./caso.dto.js";
import { Cuota } from "../cuota/cuota.entity.js";
import { EstadoCasoEnum, FrecuenciaPagoEnum } from "../../../utils/enums.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { Politicas } from "../../misc/politicas/politicas.entity.js";
import {
  validateDate,
  validateEntity,
  validateEnum,
  validateNumericId,
  validatePrice,
} from "../../../utils/validators.js";
import { politicasService } from "../../misc/politicas/politicas.service.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const sixtyDaysAgo = format(subMonths(new Date(), 2), "yyyy-MM-dd");

      const casos = await em.find(
        Caso,
        {
          $or: [
            {
              fecha_estado: { $gte: sixtyDaysAgo },
            },
            {
              estado: EstadoCasoEnum.EN_CURSO,
            },
          ],
        },
        { populate: ["cliente.usuario", "especialidad"] }
      );

      const data = casos.map((c) => new CasoDTO(c));

      res.status(200).json({
        message: "Todos los casos fueron encontrados.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findCurrent: async (_req: Request, res: Response) => {
    try {
      const casos = await em.find(
        Caso,
        { estado: EstadoCasoEnum.EN_CURSO },
        { populate: ["cliente.usuario", "especialidad"] }
      );

      const data = casos.map((c) => new CasoDTO(c));

      res.status(200).json({
        message: "Todos los casos en curso fueron encontrados.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findOne: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const caso = await em.findOneOrFail(
        Caso,
        { id },
        { populate: ["cliente.usuario", "especialidad"] }
      );

      const data = new CasoDTO(caso);

      res.status(200).json({
        message: "El caso fue encontrado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const caso = em.create(Caso, req.body.sanitizedInput);
      caso.estado = EstadoCasoEnum.EN_CURSO;

      //TODO validar que el abogado principal tenga asociada la especialidad del caso
      validateEntity(caso);
      await em.flush();
      await em.refresh(caso);

      const data = new CasoDTO(caso);

      res.status(201).json({
        message: "Caso creado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const caso = await em.findOneOrFail(Caso, id);

      if (caso.estado !== EstadoCasoEnum.EN_CURSO)
        throw new HttpError(
          400,
          'El caso no se encuentra con estado "en curso"'
        );

      em.assign(caso, req.body.sanitizedInput);
      validateEntity(caso);
      //TODO validar que el abogado principal tenga asociada la especialidad del caso

      await em.flush();
      const data = new CasoDTO(caso);

      res.status(200).json({
        message: "Caso actualizado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  finalizar: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const caso = await em.findOneOrFail(Caso, id);

      if (caso.estado !== EstadoCasoEnum.EN_CURSO) {
        res
          .status(400)
          .json({ message: 'El caso no se encuentra con estado "en curso"' });
        return;
      }

      const politicas = await politicasService.loadPoliticas();

      if (req.body.sanitizedInput.num_cuotas > politicas.max_cuotas) {
        res.status(400).json({
          message: `El número de cuotas (${req.body.sanitizedInput.num_cuotas}) excede el máximo permitido (${politicas.max_cuotas}).`,
        });
        return;
      }

      caso.estado = EstadoCasoEnum.FINALIZADO;
      caso.fecha_estado = format(new Date(), "yyyy-MM-dd");
      const cuotas: Cuota[] = generateCuotas(caso, req.body.sanitizedInput);

      await em.flush();

      const data = CasoDTO.fromCasoAndCuotas(caso, cuotas);

      res.status(200).json({
        message: "Caso finalizado y cuotas generadas.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  deactivate: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const caso = await em.findOneOrFail(Caso, id);

      if (caso.estado !== EstadoCasoEnum.EN_CURSO)
        throw new HttpError(
          400,
          'El caso no se encuentra con estado "en curso"'
        );

      caso.estado = EstadoCasoEnum.CANCELADO;
      caso.fecha_estado = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      res.status(200).json({
        message: "Caso cancelado.",
        data: caso,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitizeCaso: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        cliente: validateNumericId(req.body.id_cliente, "id_cliente"),
        especialidad: validateNumericId(
          req.body.id_especialidad,
          "id_especialidad"
        ),
        descripcion: req.body.descripcion?.trim(),
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

  sanitizeFinalizarCaso: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        cant_jus: validatePrice(req.body.cant_jus, 3, "cant_jus", true, false),

        fecha_primer_cobro: validateDate(
          req.body.fecha_primer_cobro,
          "fecha_primer_cobro"
        ),

        frecuencia_cobro: validateEnum(
          req.body.frecuencia_cobro,
          FrecuenciaPagoEnum,
          "frecuencia_cobro",
          true
        ),

        num_cuotas: validateNumericId(req.body.num_cuotas, "num_cuotas"),
      };

      if (
        !req.body.sanitizedInput.fecha_primer_cobro ||
        req.body.sanitizedInput.fecha_primer_cobro <
          format(new Date(), "yyyy-MM-dd")
      ) {
        res.status(400).json({
          message:
            "fecha_primer_cobro: debe ser igual o posterior a la fecha actual.",
        });
        return;
      }

      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};

function generateCuotas(caso: Caso, input: any): Cuota[] {
  let cuotas: Cuota[] = [];
  let nextDate = input.fecha_primer_cobro;
  const jusCuota = parseFloat((input.cant_jus / input.num_cuotas).toFixed(3));

  for (let i = 0; i < input.num_cuotas; i++) {
    const cuota = em.create(Cuota, {
      caso,
      numero: i + 1,
      cant_jus: jusCuota,
      fecha_vencimiento: nextDate,
    });

    cuotas.push(cuota);
    nextDate = calculateNextExpirationDate(nextDate, input.frecuencia_cobro);
  }

  let difference = input.cant_jus - jusCuota * input.num_cuotas;
  difference = parseFloat(difference.toFixed(3));
  cuotas[0].cant_jus += difference;

  return cuotas;
}

function calculateNextExpirationDate(date: string, frequency: string): string {
  const utcDate = addHours(new Date(date), 3);
  let expirationDate: Date;

  switch (frequency) {
    case FrecuenciaPagoEnum.SEMANAL:
      expirationDate = addDays(utcDate, 7);
      break;
    case FrecuenciaPagoEnum.QUINCENAL:
      expirationDate = addDays(utcDate, 15);
      break;
    case FrecuenciaPagoEnum.MENSUAL:
      expirationDate = addMonths(utcDate, 1);
      break;
    case FrecuenciaPagoEnum.TRIMESTRAL:
      expirationDate = addMonths(utcDate, 3);
      break;
    case FrecuenciaPagoEnum.SEMESTRAL:
      expirationDate = addMonths(utcDate, 6);
      break;
    case FrecuenciaPagoEnum.ANUAL:
      expirationDate = addYears(utcDate, 1);
      break;
    default:
      throw new HttpError(400, `Frecuencia no válida: ${frequency}`);
  }

  return format(expirationDate, "yyyy-MM-dd");
}
