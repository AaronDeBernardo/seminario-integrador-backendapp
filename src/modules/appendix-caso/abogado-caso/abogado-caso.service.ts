import { format } from "date-fns";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { AbogadoCaso } from "../abogado-caso/abogado-caso.entity.js";
import { AbogadoEspecialidad } from "../../especialidad/abogado-especialidad/abogado-especialidad.entity.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const abogadoCasoService = {
  checkAbogadoAvailability: async (
    id_abogado: Abogado,
    id_especialidad: Especialidad,
    already_working_in_caso: boolean
  ) => {
    const abogadoEspecialidad = await em.findOne(AbogadoEspecialidad, {
      abogado: id_abogado,
      especialidad: id_especialidad,
    });

    if (!abogadoEspecialidad)
      throw new HttpError(
        400,
        "El abogado no tiene asociada la especialidad elegida para el caso."
      );

    const count = await em.count(AbogadoCaso, {
      abogado: id_abogado,
      fecha_baja: null,
      caso: { estado: { $eq: EstadoCasoEnum.EN_CURSO } },
    });

    if (!already_working_in_caso && count > 5)
      throw new HttpError(
        400,
        "Un abogado no puede trabajar en más de 5 casos a la vez."
      );
  },

  isAbogadoWorkingOnCaso: async (
    id_abogado: number,
    id_caso: number
  ): Promise<boolean> => {
    const abogado = await em.findOne(AbogadoCaso, {
      caso: { id: id_caso, estado: EstadoCasoEnum.EN_CURSO },
      fecha_baja: null,
      abogado: id_abogado as any,
    });

    if (abogado) return true;
    else return false;
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
        abogado: id_abogado_principal as any,
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
};
