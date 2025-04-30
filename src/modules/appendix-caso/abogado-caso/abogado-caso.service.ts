import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { AbogadoCaso } from "../abogado-caso/abogado-caso.entity.js";
import { AbogadoEspecialidad } from "../../especialidad/abogado-especialidad/abogado-especialidad.entity.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { format } from "date-fns";
import fs from "fs";
import handlebars from "handlebars";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";
import { sendEmail } from "../../../utils/notifications.js";

const em = orm.em;

export const abogadoCasoService = {
  checkAbogadoAvailability: async (
    id_abogado: Abogado,
    id_especialidad: Especialidad,
    already_working_in_caso: boolean
  ) => {
    const abogadoEspecialidad = await em.findOne(
      AbogadoEspecialidad,
      {
        abogado: id_abogado,
        especialidad: id_especialidad,
      },
      { populate: ["abogado.usuario"] }
    );

    if (!abogadoEspecialidad)
      throw new HttpError(
        400,
        "El abogado no tiene asociada la especialidad elegida para el caso."
      );

    if (abogadoEspecialidad.abogado.usuario.fecha_baja !== null)
      throw new HttpError(400, "El abogado está dado de baja.");

    const count = await em.count(AbogadoCaso, {
      abogado: id_abogado,
      fecha_baja: null,
      caso: { estado: { $eq: EstadoCasoEnum.EN_CURSO } },
    });

    if (!already_working_in_caso && count >= 5)
      throw new HttpError(
        400,
        "Un abogado no puede trabajar en más de 5 casos a la vez."
      );
  },

  isAbogadoWorkingOnCaso: async (
    id_abogado: number,
    id_caso: number,
    checkEstadoEnCurso: boolean
  ): Promise<boolean> => {
    const filter = checkEstadoEnCurso
      ? {
          caso: { id: id_caso, estado: EstadoCasoEnum.EN_CURSO },
        }
      : { caso: { id: id_caso } };

    const abogado = await em.findOne(AbogadoCaso, {
      ...filter,
      fecha_baja: null,
      abogado: { usuario: id_abogado },
    });

    return Boolean(abogado);
  },

  checkAbogadoWorkingOnCaso: async (
    id_abogado: number,
    id_caso: number,
    checkEstadoEnCurso: boolean
  ) => {
    const isWorking = await abogadoCasoService.isAbogadoWorkingOnCaso(
      id_abogado,
      id_caso,
      checkEstadoEnCurso
    );

    if (isWorking === false) throw new HttpError(403, "Acceso denegado.");
  },

  checkAbogadoPrincipal: async (id_abogado: number, id_caso: number) => {
    //No le interesa si el caso está en curso, finalizó o fue cancelado.

    const abogado = await em.findOne(AbogadoCaso, {
      caso: id_caso,
      fecha_baja: null,
      es_principal: true,
      abogado: { usuario: id_abogado },
    });

    if (abogado) return;
    else throw new HttpError(403, "Acceso denegado.");
  },

  updateAbogadoPrincipal: async (
    id_caso: number,
    id_abogado_principal: number,
    id_especialidad: number,
    especialidad: Especialidad
  ) => {
    const abogado_principal = await em.findOneOrFail(AbogadoCaso, {
      caso: id_caso,
      es_principal: true,
      fecha_baja: null,
    });

    let abogado_changed = false;
    let especialidad_changed = false;
    let id_abogado_check = abogado_principal.abogado.usuario.id;
    let id_especialidad_check = especialidad.id;
    let abogado_already_working = false;

    if (
      id_abogado_principal !== undefined &&
      id_abogado_principal !== id_abogado_check
    ) {
      abogado_changed = true;
      id_abogado_check = id_abogado_principal;
      abogado_principal.fecha_baja = format(new Date(), "yyyy-MM-dd");

      const abogado_nuevo_existente = await em.findOne(AbogadoCaso, {
        caso: id_caso,
        fecha_baja: null,
        abogado: { usuario: id_abogado_principal },
      });

      if (abogado_nuevo_existente) {
        abogado_already_working = true;
        abogado_nuevo_existente.fecha_baja = format(new Date(), "yyyy-MM-dd");
      }

      em.create(AbogadoCaso, {
        abogado: id_abogado_principal as any,
        caso: id_caso,
        es_principal: true,
      });
    }

    if (
      id_especialidad !== undefined &&
      id_especialidad !== id_especialidad_check
    ) {
      especialidad_changed = true;
      id_especialidad_check = id_especialidad;
    }

    if (abogado_changed || especialidad_changed) {
      await abogadoCasoService.checkAbogadoAvailability(
        id_abogado_check as unknown as Abogado,
        id_especialidad_check as unknown as Especialidad,
        abogado_already_working
      );
    }
  },

  sendCasoAsignadoMail: async (
    abogadoCaso: AbogadoCaso,
    indicaciones: string
  ) => {
    try {
      const templateSource = fs.readFileSync(
        "templates/caso-asignado.html",
        "utf8"
      );

      const template = handlebars.compile(templateSource);

      const nombreAbogado = abogadoCaso.abogado.usuario.nombre;

      const usuarioCliente = abogadoCaso.caso.cliente.usuario;
      let nombreCliente = usuarioCliente.nombre;
      if (usuarioCliente.apellido)
        nombreCliente += " " + usuarioCliente.apellido;

      if (indicaciones) indicaciones = `Indicaciones: ${indicaciones}`;
      const data = {
        idCaso: abogadoCaso.caso.id,
        especialidad: abogadoCaso.caso.especialidad.nombre,
        descripcion: abogadoCaso.caso.descripcion,
        nombreAbogado,
        nombreCliente,
        indicaciones,
      };

      const htmlContent = template(data);

      await sendEmail(`Nuevo caso asignado`, htmlContent, [
        abogadoCaso.abogado.usuario.email,
      ]);
    } catch {
      // intentionally left blank
    }
  },

  sendCasoDesasignadoMail: async (abogadoCaso: AbogadoCaso, motivo: string) => {
    try {
      const templateSource = fs.readFileSync(
        "templates/caso-desasignado.html",
        "utf8"
      );

      const template = handlebars.compile(templateSource);

      const nombreAbogado = abogadoCaso.abogado.usuario.nombre;

      const usuarioCliente = abogadoCaso.caso.cliente.usuario;
      let nombreCliente = usuarioCliente.nombre;
      if (usuarioCliente.apellido)
        nombreCliente += " " + usuarioCliente.apellido;

      if (motivo) motivo = `Motivo: ${motivo}`;
      const data = {
        idCaso: abogadoCaso.caso.id,
        especialidad: abogadoCaso.caso.especialidad.nombre,
        nombreAbogado,
        nombreCliente,
        motivo,
      };

      const htmlContent = template(data);

      await sendEmail(`Desasignación de caso`, htmlContent, [
        abogadoCaso.abogado.usuario.email,
      ]);
    } catch (err) {
      console.log(err);
      // intentionally left blank
    }
  },
};
