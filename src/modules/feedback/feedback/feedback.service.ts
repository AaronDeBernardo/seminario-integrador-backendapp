import { format, subMonths } from "date-fns";
import { EstadoCasoEnum } from "../../../utils/enums.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

interface AbogadoCalificable {
  id: number;
  id_abogado: number;
  nombre: string;
  apellido: string;
  matricula: string;
  foto: Buffer;
  fecha_alta: string;
  es_principal: boolean;
  fecha_baja: string;
}

export const feedbackService = {
  getAbogadosForFeedback: async (
    id_caso: number
  ): Promise<AbogadoCalificable[]> => {
    const dateFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd");

    const abogados: AbogadoCalificable[] = await em.execute(
      `
      SELECT us.nombre, us.apellido
		    , ab.matricula, ab.foto
        , ab_ca.id_abogado, ab_ca.fecha_alta, ab_ca.es_principal, ab_ca.fecha_baja
	    FROM abogados_casos ab_ca
	    INNER JOIN casos ca
		    ON ca.id = ab_ca.id_caso
	    INNER JOIN abogados ab
		    ON ab.id_usuario = ab_ca.id_abogado
      INNER JOIN usuarios us
        ON us.id = ab.id_usuario
      LEFT JOIN feedbacks fe
        ON fe.id_abogado = ab_ca.id_abogado
        AND fe.id_caso = ab_ca.id_caso
      WHERE ca.id = ?
        AND ca.estado = ?
        AND ca.fecha_estado >= ?
        AND fe.id_abogado IS NULL
      ORDER BY us.nombre, us.apellido;
      `,
      [id_caso, EstadoCasoEnum.FINALIZADO, dateFrom]
    );

    const resultado: AbogadoCalificable[] = Object.values(
      abogados.reduce(
        (acc: { [key: number]: AbogadoCalificable }, a: AbogadoCalificable) => {
          if (!acc[a.id_abogado]) {
            acc[a.id_abogado] = a;
          } else if (
            a.fecha_baja === null ||
            a.fecha_baja > acc[a.id_abogado].fecha_baja
          ) {
            acc[a.id_abogado] = a;
          }

          return acc;
        },
        {}
      )
    );

    resultado.forEach((a) => {
      if (a.es_principal && a.fecha_baja === null) a.es_principal = true;
      else a.es_principal = false;
    });

    return resultado;
  },

  isAbogadoCalificable: async (
    id_abogado: number,
    id_caso: number
  ): Promise<boolean> => {
    const dateFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd");

    const calificable = await em.execute(
      `
      SELECT 1
      FROM abogados_casos ab_ca
      INNER JOIN casos ca
        ON ca.id = ab_ca.id_caso
      LEFT JOIN feedbacks fe
        ON fe.id_abogado = ab_ca.id_abogado
        AND fe.id_caso = ab_ca.id_caso
      WHERE ab_ca.id_abogado = ?
        AND ab_ca.id_caso = ?
        AND ca.estado = ?
        AND ca.fecha_estado >= ?
      	AND fe.id_abogado IS NULL;
        `,
      [id_abogado, id_caso, EstadoCasoEnum.FINALIZADO, dateFrom]
    );

    if (calificable.length !== 0) return true;
    else return false;
  },
};
