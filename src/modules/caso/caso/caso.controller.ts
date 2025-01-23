import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { Caso } from "./caso.entity.js";
import { CasoDTO } from "./caso.dto.js";
import { handleError } from "../../../utils/error-handler.js";
import {
  validateEntity,
  validateNumericId,
} from "../../../utils/validators.js";
import { Cliente } from "../../usuario/cliente/cliente.entity.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";

const em = orm.em;

type CasoUpdateData = {
  estado: string;
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
              estado: "En curso",
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
        { estado: "En curso" },
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

      if (req.body.fecha_estado) {
        updateData.fecha_estado = req.body.fecha_estado;
      } else if (req.body.estado) {
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

  deactivate: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const caso = await em.findOneOrFail(Caso, { id });

      const updateData: CasoUpdateData = {
        estado: "Cancelado",
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
      req.body.sanitizedInput = {
        cliente: validateNumericId(req.body.id_cliente, "id_cliente"),
        especialidad: validateNumericId(
          req.body.id_especialidad,
          "id_especialidad"
        ),
        descripcion: req.body.descripcion?.trim(),
        monto_caso: req.body.monto_caso,
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
