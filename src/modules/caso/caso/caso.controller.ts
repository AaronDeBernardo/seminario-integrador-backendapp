import { addDays, addMonths, addYears, format, subMonths } from "date-fns";
import { Caso } from "./caso.entity.js";
import { CasoDTO } from "./caso.dto.js";
import { Cuota } from "../cuota/cuota.entity.js";
import { CuotaDTO } from "../cuota/cuota.dto.js";
import { EstadoCaso } from "./caso.entity.js";
import { handleError } from "../../../utils/error-handler.js";
import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Politica } from "../../misc/politica/politica.entity.js";
import {
  validateDate,
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { HttpError } from "../../../utils/http-error.js";

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
              estado: EstadoCaso.EN_CURSO,
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
        { estado: EstadoCaso.EN_CURSO },
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
      caso.estado = EstadoCaso.EN_CURSO;

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

      if (caso.estado !== EstadoCaso.EN_CURSO)
        throw new HttpError(
          400,
          'El caso no se encuentra con estado "en curso"'
        );

      em.assign(caso, req.body.sanitizedInput);
      validateEntity(caso);

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

  end: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const caso = await em.findOneOrFail(Caso, { id });

      const {
        cant_jus,
        fecha_primer_cobro,
        frecuencia_pago,
        num_cuotas,
        forma_cobro,
      } = req.body;

      if (
        !cant_jus ||
        !fecha_primer_cobro ||
        !frecuencia_pago ||
        !num_cuotas ||
        !forma_cobro
      ) {
        res
          .status(400)
          .json({ message: "Faltan campos requeridos para finalizar el caso" });
        return;
      }

      const valid_fecha_primer_cobro = validateDate(
        fecha_primer_cobro,
        "fecha_primer_cobro"
      );

      const politica = await em.findOne(
        Politica,
        {},
        { orderBy: { id: "DESC" } }
      );
      if (!politica) {
        res.status(404).json({
          message: "No se encontró ninguna política para validar las cuotas.",
        });
        return;
      }

      if (num_cuotas > politica.max_cuotas) {
        res.status(400).json({
          message: `El número de cuotas (${num_cuotas}) excede el máximo permitido (${politica.max_cuotas}).`,
        });
        return;
      }

      caso.estado = EstadoCaso.FINALIZADO;
      caso.fecha_estado = new Date().toISOString().split("T")[0];

      const cuotas: Cuota[] = [];
      const today = new Date(valid_fecha_primer_cobro);

      for (let i = 0; i < num_cuotas; i++) {
        const cuota = em.create(Cuota, {
          caso,
          numero: i + 1,
          cant_jus: cant_jus / num_cuotas,
          fecha_vencimiento: controller.calculateExpirationDate(
            new Date(today),
            frecuencia_pago
          ),
          fecha_hora_cobro: null,
          forma_cobro: forma_cobro,
        });
        cuotas.push(cuota);
        validateEntity(cuota);

        controller.incrementDate(today, frecuencia_pago);
      }

      await em.flush();

      const data = {
        caso: new CasoDTO(caso),
        cuotas: cuotas.map((c) => new CuotaDTO(c)),
      };

      res.status(200).json({
        message: "Caso finalizado y cuotas generadas.",
        data,
      });
    } catch (error: any) {
      next(error);
    }
  },

  calculateExpirationDate(date: Date, frequency: string): string {
    let expirationDate: Date;

    switch (frequency) {
      case "semanal":
        expirationDate = addDays(date, 7);
        break;
      case "quincenal":
        expirationDate = addDays(date, 15);
        break;
      case "mensual":
        expirationDate = addMonths(date, 1);
        break;
      case "trimestral":
        expirationDate = addMonths(date, 3);
        break;
      case "bimestral":
        expirationDate = addMonths(date, 6);
        break;
      case "anual":
        expirationDate = addYears(date, 1);
        break;
      default:
        throw new Error(`Frecuencia no válida: ${frequency}`);
    }

    return format(expirationDate, "yyyy-MM-dd");
  },

  incrementDate(date: Date, frequency: string): void {
    switch (frequency) {
      case "semanal":
        addDays(date, 7);
        break;
      case "quincenal":
        addDays(date, 15);
        break;
      case "mensual":
        addMonths(date, 1);
        break;
      case "trimestral":
        addMonths(date, 3);
        break;
      case "bimestral":
        addMonths(date, 6);
        break;
      case "anual":
        addYears(date, 1);
        break;
      default:
        throw new Error(`Frecuencia no válida: ${frequency}`);
    }
  },

  deactivate: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const caso = await em.findOneOrFail(Caso, id);

      if (caso.estado !== EstadoCaso.EN_CURSO)
        throw new HttpError(
          400,
          'El caso no se encuentra con estado "en curso"'
        );

      caso.estado = EstadoCaso.CANCELADO;
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

  sanitize: (req: Request, res: Response, next: NextFunction) => {
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
};
