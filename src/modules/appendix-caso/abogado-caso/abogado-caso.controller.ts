import { NextFunction, Request, Response } from "express";
import { AbogadoCaso } from "./abogado-caso.entity.js";
import { AbogadoCasoDTO } from "./abogado-caso.dto.js";
import { abogadoCasoService } from "./abogado-caso.service.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { handleError } from "../../../utils/error-handler.js";
import { orm } from "../../../config/db.config.js";
import { validateNumericId } from "../../../utils/validators.js";

const em = orm.em;

export const controller = {
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

  link: async (req: Request, res: Response): Promise<void> => {
    try {
      const caso = await em.findOneOrFail(Caso, {
        id: req.body.sanitizedInput.caso,
        estado: EstadoCasoEnum.EN_CURSO,
      });

      const existingRelation = await em.findOne(AbogadoCaso, {
        abogado: req.body.sanitizedInput.abogado,
        caso: caso,
        fecha_baja: null,
      });

      if (existingRelation) {
        res.status(400).json({
          message: "El abogado ya se encuentra asociado al caso.",
        });
        return;
      }

      await abogadoCasoService.checkAbogadoAvailability(
        req.body.sanitizedInput.abogado,
        caso.especialidad,
        false
      );

      const abogadoCaso = em.create(AbogadoCaso, req.body.sanitizedInput);
      await em.flush();

      //TODO enviar email al abogado con el detalle
      const data = new AbogadoCasoDTO(abogadoCaso);

      res.status(201).json({
        message: "El abogado fue asociado al caso.",
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
      req.body.sanitizedInput = {
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        es_principal: req.body.es_principal,
        detalle: req.body.detalle?.trim(),
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
