import { NextFunction, Request, Response } from "express";
import { AbogadoCaso } from "./abogado-caso.entity.js";
import { AbogadoCasoDTO } from "./abogado-caso.dto.js";
import { abogadoCasoService } from "./abogado-caso.service.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { format } from "date-fns";
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
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  link: async (req: Request, res: Response): Promise<void> => {
    try {
      //TODO validar que los abogados que se asignen no estén dados de baja, lo mismo con clientes... En actividades está realizada la verificación
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
      await em.refresh(abogadoCaso);

      //TODO enviar email al abogado con el detalle
      const data = new AbogadoCasoDTO(abogadoCaso);

      res.status(201).json({
        message: "El abogado fue asociado al caso.",
        data,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  unlink: async (req: Request, res: Response): Promise<void> => {
    try {
      const id_abogado_caso = validateNumericId(req.params.id, "id");

      const abogadoCaso = await em.findOne(AbogadoCaso, {
        id: id_abogado_caso,
        fecha_baja: null,
        caso: { estado: EstadoCasoEnum.EN_CURSO },
      });

      if (!abogadoCaso) {
        res.status(404).json({
          message: "No se encontró la relación entre el caso y el abogado.",
        });
        return;
      }

      if (abogadoCaso.es_principal === true) {
        res.status(409).json({
          message:
            "No se puede desvincular al abogado principal del caso. Primero asigne otro.",
        });
        return;
      }

      abogadoCaso.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      //TODO enviar email con detalle

      const data = new AbogadoCasoDTO(abogadoCaso);
      res.status(200).json({
        message: "Abogado desvinculado del caso exitosamente.",
        data,
      });
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        caso: validateNumericId(req.body.id_caso, "id_caso"),
        detalle: req.body.detalle?.trim(),
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
