import { Caso } from "./caso.entity.js";
import { CasoDTO } from "./caso.dto.js";
import { Cliente } from "../../usuario/cliente/cliente.entity.js";
import { Cuota } from "../cuota/cuota.entity.js";
import { CuotaDTO } from "../cuota/cuota.dto.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";
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

const em = orm.em;

type CasoUpdateData = {
  estado: EstadoCaso;
  fecha_estado: string;
};

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const casos = await em.find(
        Caso,
        {
          $or: [
            {
              fecha_inicio: { $gte: sixtyDaysAgo.toISOString().split("T")[0] },
            },
            {
              fecha_inicio: { $lt: sixtyDaysAgo.toISOString().split("T")[0] },
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
        message: "Todos los casos fueron encontrados.",
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
      const casoData = {
        ...req.body.sanitizedInput,
        estado: "En curso",
        fecha_estado: new Date().toISOString().split("T")[0],
        fecha_inicio: new Date().toISOString().split("T")[0],
      };

      const caso = em.create(Caso, casoData);
      validateEntity(caso);

      await em.flush();

      await em.populate(caso, ["cliente.usuario", "especialidad"]);

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
      const caso = await em.findOneOrFail(Caso, { id });

      const updateData: Partial<Caso> = {};

      if (req.body.estado) {
        updateData.estado = req.body.estado;
      }

      if (req.body.estado) {
        updateData.fecha_estado = new Date().toISOString().split("T")[0];
      }

      if (req.body.descripcion) {
        updateData.descripcion = req.body.descripcion.trim();
      }

      if (req.body.id_cliente) {
        const cliente = await em.findOneOrFail(
          Cliente,
          { usuario: validateNumericId(req.body.id_cliente, "id_cliente") },
          { populate: ["usuario"] }
        );
        updateData.cliente = cliente;
      }

      if (req.body.id_especialidad) {
        updateData.especialidad = await em.findOneOrFail(Especialidad, {
          id: validateNumericId(req.body.id_especialidad, "id_especialidad"),
        });
      }

      if (req.body.monto_caso !== undefined) {
        updateData.monto_caso = req.body.monto_caso;
      }

      em.assign(caso, updateData);

      validateEntity(caso);
      await em.flush();

      await em.populate(caso, ["cliente.usuario", "especialidad"]);

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
    switch (frequency) {
      case "semanal":
        date.setDate(date.getDate() + 7);
        break;
      case "quincenal":
        date.setDate(date.getDate() + 15);
        break;
      case "mensual":
        date.setMonth(date.getMonth() + 1);
        break;
      case "trimestral":
        date.setMonth(date.getMonth() + 3);
        break;
      case "bimerstral":
        date.setMonth(date.getMonth() + 6);
        break;
      case "anual":
        date.setMonth(date.getMonth() + 12);
        break;
    }
    return date.toISOString().split("T")[0];
  },

  incrementDate(date: Date, frequency: string): void {
    switch (frequency) {
      case "semanal":
        date.setDate(date.getDate() + 7);
        break;
      case "quincenal":
        date.setDate(date.getDate() + 15);
        break;
      case "mensual":
        date.setMonth(date.getMonth() + 1);
        break;
      case "trimestral":
        date.setMonth(date.getMonth() + 3);
        break;
      case "bimerstral":
        date.setMonth(date.getMonth() + 6);
        break;
      case "anual":
        date.setMonth(date.getMonth() + 12);
        break;
    }
  },

  deactivate: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const caso = await em.findOneOrFail(Caso, { id });

      const updateData: CasoUpdateData = {
        estado: EstadoCaso.CANCELADO,
        fecha_estado: new Date().toISOString().split("T")[0],
      };

      em.assign(caso, updateData);
      await em.flush();

      await em.populate(caso, ["cliente", "especialidad"]);

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
      const sanitizedInput: any = {};

      if (req.body.id_cliente) {
        sanitizedInput.cliente = validateNumericId(
          req.body.id_cliente,
          "id_cliente"
        );
      }

      if (req.body.id_especialidad) {
        sanitizedInput.especialidad = validateNumericId(
          req.body.id_especialidad,
          "id_especialidad"
        );
      }

      if (req.body.descripcion) {
        sanitizedInput.descripcion = req.body.descripcion.trim();
      }

      if (req.body.monto_caso !== undefined) {
        sanitizedInput.monto_caso = req.body.monto_caso;
      }

      req.body.sanitizedInput = sanitizedInput;

      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
