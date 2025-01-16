import { addHours, getDay, isToday, startOfDay } from "date-fns";
import { NextFunction, Request, Response } from "express";
import { orm } from "../../../config/db.config.js";
import { HorarioTurno } from "./horario-turno.entity.js";
import { HorarioTurnoDTO } from "./horario-turno.dto.js";
import { TurnoOtorgado } from "../turno-otorgado/turno-otorgado.entity.js";
import { validateNumericId } from "../../../utils/validators.js";
import { HttpError } from "../../../utils/http-error.js";

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

      res.status(200).json({
        message: "Todos los horarios de turnos fueron encontrados.",
        data,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  findAvailable: async (req: Request, res: Response, next: NextFunction) => {
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

      res.status(200).json({
        message: "Todos los horarios de turnos fueron encontrados.",
        data,
      });
    } catch (error: any) {
      if (error instanceof HttpError) error.send(res);
      else res.status(500).json({ message: error.message });
    }
  },

  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body.sanitizedInput;

      if (input.hora_inicio >= input.hora_fin)
        throw new HttpError(400, "La hora de inicio es posterior a la de fin.");

      if (input.dia_semana < 0 || input.dia_semana > 6)
        throw new HttpError(400, "Día no válido.");

      const horarioTurno = em.create(HorarioTurno, req.body.sanitizedInput);
      await em.flush();

      res
        .status(201)
        .json({ message: "Horario de turno creado.", data: horarioTurno });
    } catch (error: any) {
      if (error instanceof HttpError) error.send(res);
      else res.status(500).json({ message: error.message });
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const input = req.body.sanitizedInput;

      const horarioTurno = await em.findOneOrFail(HorarioTurno, id);
      em.assign(horarioTurno, input);

      if (input.hora_inicio >= input.hora_fin)
        throw new HttpError(400, "La hora de inicio es posterior a la de fin.");

      if (input.dia_semana < 0 || input.dia_semana > 6)
        throw new HttpError(400, "Día no válido.");

      await em.flush();

      res
        .status(200)
        .json({ message: "Horario de turno actualizado.", data: horarioTurno });
    } catch (error: any) {
      if (error instanceof HttpError) error.send(res);
      else {
        let errorCode = 500;
        if (error.message.match("not found")) errorCode = 404;
        res.status(errorCode).json({ message: error.message });
      }
    }
  },

  logicalDelete: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      const horarioTurno = await em.findOneOrFail(HorarioTurno, id);
      horarioTurno.fecha_baja = new Date();
      await em.flush();

      const data = new HorarioTurnoDTO(horarioTurno);
      res.status(200).json({
        message: "Horario de turno dado de baja.",
        data,
      });
    } catch (error: any) {
      let errorCode = 500;
      if (error.message.match("not found")) errorCode = 404;
      res.status(errorCode).json({ message: error.message });
    }
  },

  sanitize: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.sanitizedInput = {
        abogado: validateNumericId(req.body.id_abogado, "id_abogado"),
        hora_inicio: req.body.hora_inicio,
        hora_fin: req.body.hora_fin,
        dia_semana: req.body.dia_semana,
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
