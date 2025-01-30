import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { AbogadoCaso } from "./abogado-caso.entity.js";
import { AbogadoCasoDTO } from "./abogado-caso.dto.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { handleError } from "../../../utils/error-handler.js";
import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const abogadoCasos = await em.find(
        AbogadoCaso,
        {},
        { populate: ["abogado.usuario", "caso"] }
      );

      const data = abogadoCasos.map((ac) => new AbogadoCasoDTO(ac));

      res.status(200).json({
        message: "Todas las relaciones abogado-caso fueron encontradas.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  findByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");

      const abogadoCasos = await em.find(
        AbogadoCaso,
        {
          caso: id_caso,
          fecha_baja: null,
        },
        { populate: ["abogado.usuario", "caso"] }
      );

      const data = abogadoCasos.map((ac) => new AbogadoCasoDTO(ac));

      res.status(200).json({
        message:
          "Relaciones abogado-caso encontradas para el caso especificado.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_abogado = validateNumericId(req.body.id_abogado, "id_abogado");
      const id_caso = validateNumericId(req.body.id_caso, "id_caso");

      const existingRelation = await em.findOne(AbogadoCaso, {
        abogado: id_abogado,
        caso: id_caso,
        fecha_baja: null,
      });

      if (existingRelation) {
        res.status(400).json({
          message: "Ya existe una relación activa entre este abogado y caso.",
        });
        return;
      }

      const [abogado, caso] = await Promise.all([
        em.findOneOrFail(Abogado, { usuario: id_abogado }),
        em.findOneOrFail(Caso, { id: id_caso }),
      ]);

      const abogadoCaso = em.create(AbogadoCaso, {
        abogado,
        caso,
        fecha_alta: new Date().toISOString().split("T")[0],
      });

      await em.flush();
      await em.populate(abogadoCaso, ["abogado.usuario", "caso"]);

      const data = new AbogadoCasoDTO(abogadoCaso);

      res.status(201).json({
        message: "Relación abogado-caso creada.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  link: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_nuevo_abogado = validateNumericId(
        req.body.id_abogado,
        "id_abogado"
      );

      const relacionExistente = await em.findOne(AbogadoCaso, {
        caso: id_caso,
        abogado: id_nuevo_abogado,
        fecha_baja: null,
      });

      if (relacionExistente) {
        res.status(400).json({
          message: "El abogado ya está vinculado activamente a este caso.",
        });
        return;
      }

      const relacionInactiva = await em.findOne(AbogadoCaso, {
        caso: id_caso,
        abogado: id_nuevo_abogado,
        fecha_baja: { $ne: null },
      });

      if (relacionInactiva) {
        relacionInactiva.fecha_alta = new Date().toISOString().split("T")[0];
        relacionInactiva.fecha_baja = undefined;
        await em.flush();

        await em.populate(relacionInactiva, ["abogado.usuario", "caso"]);
        const data = new AbogadoCasoDTO(relacionInactiva);

        res.status(200).json({
          message: "El abogado fue reactivado en el caso exitosamente.",
          data,
        });
        return;
      }

      const [caso, nuevoAbogado] = await Promise.all([
        em.findOneOrFail(Caso, { id: id_caso }),
        em.findOneOrFail(Abogado, { usuario: id_nuevo_abogado }),
      ]);

      const nuevaRelacion = em.create(AbogadoCaso, {
        abogado: nuevoAbogado,
        caso,
        fecha_alta: new Date().toISOString().split("T")[0],
      });

      await em.flush();
      await em.populate(nuevaRelacion, ["abogado.usuario", "caso"]);

      const data = new AbogadoCasoDTO(nuevaRelacion);

      res.status(201).json({
        message: "Nuevo abogado vinculado al caso exitosamente.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  unlink: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_caso = validateNumericId(req.params.id_caso, "id_caso");
      const id_abogado = validateNumericId(req.params.id_abogado, "id_abogado");

      const relacionesActivas = await em.find(AbogadoCaso, {
        caso: id_caso,
        fecha_baja: null,
      });

      if (relacionesActivas.length <= 1) {
        res.status(400).json({
          message:
            "No se puede desvincular al único abogado asignado al caso. Asigne otro abogado primero.",
        });
        return;
      }

      const relacion = relacionesActivas.find(
        (r) => r.abogado.usuario.id === id_abogado
      );

      if (!relacionesActivas || relacionesActivas.length === 0) {
        res.status(404).json({
          message: "No se encontraron relaciones activas para este caso.",
        });
        return;
      }

      if (!relacion) {
        res.status(404).json({
          message:
            "No se encontró una relación activa entre el abogado y el caso especificados.",
        });
        return;
      }

      if (relacion) {
        relacion.fecha_baja = new Date().toISOString().split("T")[0];
        await em.flush();
      }

      let data;
      if (relacion) {
        await em.populate(relacion, ["abogado.usuario", "caso"]);
        data = new AbogadoCasoDTO(relacion);
        res.status(200).json({
          message: "Abogado desvinculado del caso exitosamente.",
          data,
        });
        return;
      } else {
        res.status(404).json({
          message:
            "No se encontró una relación activa entre el abogado y el caso especificados.",
        });
        return;
      }
    } catch (error: any) {
      handleError(error, res);
    }
  },

  deactivate: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const abogadoCaso = await em.findOneOrFail(AbogadoCaso, { id });

      if (abogadoCaso.fecha_baja) {
        res.status(400).json({
          message: "Esta relación abogado-caso ya está dada de baja.",
        });
      }

      abogadoCaso.fecha_baja = new Date().toISOString().split("T")[0];
      await em.flush();

      await em.populate(abogadoCaso, ["abogado.usuario", "caso"]);

      const data = new AbogadoCasoDTO(abogadoCaso);

      res.status(200).json({
        message: "Relación abogado-caso dada de baja.",
        data,
      });
    } catch (error: any) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      const sanitizedInput: any = {};

      if (req.body.id_abogado !== undefined) {
        sanitizedInput.id_abogado = validateNumericId(
          req.body.id_abogado,
          "id_abogado"
        );
      }

      if (req.body.id_nuevo_abogado !== undefined) {
        sanitizedInput.id_nuevo_abogado = validateNumericId(
          req.body.id_nuevo_abogado,
          "id_nuevo_abogado"
        );
      }

      req.body.sanitizedInput = sanitizedInput;
      next();
    } catch (error: any) {
      handleError(error, res);
    }
  },
};
