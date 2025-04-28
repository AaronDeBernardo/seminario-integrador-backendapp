import { addHours, format, getDay, startOfDay } from "date-fns";
import { NextFunction, Request, Response } from "express";
import {
  validateIntegerInRange,
  validateNumericId,
  validateTime,
} from "../../../utils/validators.js";
import { ApiResponse } from "../../../utils/api-response.class.js";
import { handleError } from "../../../utils/error-handler.js";
import { HorarioTurno } from "./horario-turno.entity.js";
import { HorarioTurnoDTO } from "./horario-turno.dto.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { TurnoOtorgado } from "../turno-otorgado/turno-otorgado.entity.js";

const em = orm.em;

export const controller = {
  findAll: async (_req: Request, res: Response) => {
    try {
      const horariosTurnos = await em.find(
        HorarioTurno,
        { fecha_baja: { $eq: null } },
        { populate: ["abogado.usuario"] }
      );

      const data = horariosTurnos.map((ht) => new HorarioTurnoDTO(ht));

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los horarios de turnos fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findAvailable: async (req: Request, res: Response) => {
    try {
      const id_abogado = Number(req.query.id_abogado) || undefined;
      const fecha = new Date(req.query.fecha as string);

      if (isNaN(fecha.getTime())) throw new HttpError(400, "Fecha no válida.");

      const fechaUtc = addHours(fecha, 3);

      if (fechaUtc < startOfDay(new Date()))
        throw new HttpError(
          400,
          "La fecha para el turno no puede ser anterior a hoy."
        );

      const dia_semana = getDay(fechaUtc);

      const qb1 = em
        .createQueryBuilder(TurnoOtorgado, "t")
        .select("t.id_horario_turno")
        .where({
          fecha_turno: { $eq: fecha },
          fecha_cancelacion: { $eq: null },
        });

      const qb2 = em
        .createQueryBuilder(HorarioTurno, "h")
        .select("*")
        .joinAndSelect("h.abogado", "a")
        .joinAndSelect("a.usuario", "u")
        .where({
          id: { $nin: qb1.getKnexQuery() },
          fecha_baja: { $eq: null },
          dia_semana,
          ...(id_abogado !== undefined && {
            abogado: id_abogado,
          }),
        });

      const horariosTurnos = await qb2.execute("all", true);
      const data = horariosTurnos.map((h) => new HorarioTurnoDTO(h));

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los horarios de turnos fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  findByAbogado: async (req: Request, res: Response) => {
    try {
      const idAbogado = validateNumericId(req.params.id_abogado, "id_abogado");

      const horariosTurnos = await em.find(HorarioTurno, {
        abogado: idAbogado,
        fecha_baja: { $eq: null },
      });

      const data = horariosTurnos.map((ht) => new HorarioTurnoDTO(ht));

      res
        .status(200)
        .json(
          new ApiResponse(
            "Todos los horarios de turnos del abogado fueron encontrados.",
            data
          )
        );
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  add: async (req: Request, res: Response) => {
    try {
      const input = req.body.sanitizedInput;

      if (input.hora_inicio >= input.hora_fin)
        throw new HttpError(400, "hora_inicio: debe ser anterior a hora_fin.");

      const horarioTurno = await em.transactional(async (em) => {
        const horarioTurnoAux = em.create(
          HorarioTurno,
          req.body.sanitizedInput
        );
        await checkScheduleConflict(horarioTurnoAux);
        return horarioTurnoAux;
      });

      const data = new HorarioTurnoDTO(horarioTurno);
      res.status(201).json(new ApiResponse("Horario de turno creado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");
      const input = req.body.sanitizedInput;

      const horarioTurno = await em.findOneOrFail(HorarioTurno, {
        id,
        fecha_baja: { $eq: null },
      });

      await em.transactional(async (em) => {
        em.assign(horarioTurno, input);
        if (horarioTurno.hora_inicio >= horarioTurno.hora_fin)
          throw new HttpError(
            400,
            "hora_inicio: debe ser anterior a hora_fin."
          );

        await checkScheduleConflict(horarioTurno);
      });

      const data = new HorarioTurnoDTO(horarioTurno);
      res
        .status(200)
        .json(new ApiResponse("Horario de turno actualizado.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = validateNumericId(req.params.id, "id");

      const horarioTurno = await em.findOneOrFail(HorarioTurno, {
        id,
        fecha_baja: { $eq: null },
      });

      horarioTurno.fecha_baja = format(new Date(), "yyyy-MM-dd");
      await em.flush();

      const data = new HorarioTurnoDTO(horarioTurno);
      res
        .status(200)
        .json(new ApiResponse("Horario de turno dado de baja.", data));
    } catch (error: unknown) {
      handleError(error, res);
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        //TODO validar que sea el abogado logueado
        hora_inicio: validateTime(req.body.hora_inicio, "hora_inicio"),
        hora_fin: validateTime(req.body.hora_fin, "hora_fin"),
        dia_semana: validateIntegerInRange(
          req.body.dia_semana,
          0,
          6,
          "dia_semana"
        ),
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

async function checkScheduleConflict(horarioTurno: HorarioTurno) {
  const conflicts = await em.find(HorarioTurno, {
    abogado: horarioTurno.abogado,
    dia_semana: horarioTurno.dia_semana,
    fecha_baja: { $eq: null },
    $not: {
      $or: [
        { hora_inicio: { $gte: horarioTurno.hora_fin } },
        { hora_fin: { $lte: horarioTurno.hora_inicio } },
      ],
    },
  });

  // Nota: si hay un solo conflicto, se trata del HorarioTurno que se está creando o modificando
  if (conflicts.length > 1)
    throw new HttpError(
      409,
      "El horario de turno se solapa con otro existente para el abogado en el mismo día."
    );
}
