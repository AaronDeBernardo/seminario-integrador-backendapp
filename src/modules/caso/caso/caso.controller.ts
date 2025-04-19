import { EstadoCasoEnum, FrecuenciaPagoEnum } from "../../../utils/enums.js";
import { format, subMonths } from "date-fns";
import { NextFunction, Request, Response } from "express";
import {
  validateDate,
  validateEntity,
  validateEnum,
  validateNumericId,
  validatePrice,
} from "../../../utils/validators.js";
import { AbogadoCaso } from "../../appendix-caso/abogado-caso/abogado-caso.entity.js";
import { AbogadoCasoDTO } from "../../appendix-caso/abogado-caso/abogado-caso.dto.js";
import { abogadoCasoService } from "../../appendix-caso/abogado-caso/abogado-caso.service.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { Caso } from "./caso.entity.js";
import { CasoDTO } from "./caso.dto.js";
import { casoService } from "./caso.service.js";
import { Cuota } from "../cuota/cuota.entity.js";
import { handleError } from "../../../utils/error-handler.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
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

      res
        .status(200)
        .json(new ApiResponse("Todos los casos fueron encontrados.", data));
    } catch (error: unknown) {
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

      res
        .status(200)
        .json(
          new ApiResponse("Todos los casos en curso fueron encontrados.", data)
        );
    } catch (error: unknown) {
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

      res.status(200).json(new ApiResponse("El caso fue encontrado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAbogadosByCaso: async (req: Request, res: Response) => {
    try {
      const id_caso = validateNumericId(req.params.id, "id");

      const abogados = await em.find(
        AbogadoCaso,
        {
          caso: id_caso,
          fecha_baja: null,
        },
        { populate: ["abogado.rol", "abogado.usuario"] }
      );

      const data = abogados.map((a) => new AbogadoCasoDTO(a));

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los abogados que se encuentran trabajando en el caso fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      await abogadoCasoService.checkAbogadoAvailability(
        req.body.sanitizedInput.abogado_principal,
        req.body.sanitizedInput.especialidad,
        false
      );

      const caso = em.create(Caso, req.body.sanitizedInput);
      caso.estado = EstadoCasoEnum.EN_CURSO;
      validateEntity(caso);

      em.create(AbogadoCaso, {
        abogado: req.body.sanitizedInput.abogado_principal,
        caso: caso,
        es_principal: true,
      });

      await em.flush();
      await em.refresh(caso);

      const data = new CasoDTO(caso);

      res.status(201).json(new ApiResponse("Caso creado.", data));
    } catch (error: unknown) {
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

      await em.transactional(async (tem) => {
        await abogadoCasoService.updateAbogadoPrincipal(
          id,
          req.body.sanitizedInput.abogado_principal,
          req.body.sanitizedInput.especialidad,
          caso.especialidad
        );

        tem.assign(caso, req.body.sanitizedInput);
        validateEntity(caso);
      });

      const data = new CasoDTO(caso);

      res.status(200).json(new ApiResponse("Caso actualizado.", data));
    } catch (error: unknown) {
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
          .json(
            new ApiResponse('El caso no se encuentra con estado "en curso"')
          );
        return;
      }

      const politicas = await politicasService.loadPoliticas();

      if (req.body.sanitizedInput.num_cuotas > politicas.max_cuotas) {
        res
          .status(400)
          .json(
            new ApiResponse(
              `El número de cuotas (${req.body.sanitizedInput.num_cuotas}) excede el máximo permitido (${politicas.max_cuotas}).`
            )
          );
        return;
      }

      caso.estado = EstadoCasoEnum.FINALIZADO;
      caso.fecha_estado = format(new Date(), "yyyy-MM-dd");
      const cuotas: Cuota[] = casoService.generateCuotas(
        caso,
        req.body.sanitizedInput
      );

      await em.flush();

      const data = CasoDTO.fromCasoAndCuotas(caso, cuotas);

      res
        .status(200)
        .json(new ApiResponse("Caso finalizado y cuotas generadas.", data));
    } catch (error: unknown) {
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

      res.status(200).json(new ApiResponse("Caso cancelado.", caso));
    } catch (error: unknown) {
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
        abogado_principal: validateNumericId(
          req.body.id_abogado_principal,
          "id_abogado_principal"
        ),
        descripcion: req.body.descripcion?.trim(),
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
        res
          .status(400)
          .json(
            new ApiResponse(
              "fecha_primer_cobro: debe ser igual o posterior a la fecha actual."
            )
          );
        return;
      }

      next();
    } catch (error: unknown) {
      handleError(error, res);
    }
  },
};
