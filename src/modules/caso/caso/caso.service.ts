import { addDays, addHours, addMonths, addYears, format } from "date-fns";
import { Caso } from "./caso.entity.js";
import { Cuota } from "../cuota/cuota.entity.js";
import { FrecuenciaPagoEnum } from "../../../utils/enums.js";
import { HttpError } from "../../../utils/http-error.js";
import { orm } from "../../../config/db.config.js";

const em = orm.em;

export const casoService = {
  generateCuotas: (caso: Caso, input: any): Cuota[] => {
    const cuotas: Cuota[] = [];
    let nextDate = input.fecha_primer_cobro;
    const jusCuota = parseFloat((input.cant_jus / input.num_cuotas).toFixed(3));

    for (let i = 0; i < input.num_cuotas; i++) {
      const cuota = em.create(Cuota, {
        caso,
        numero: i + 1,
        cant_jus: jusCuota,
        fecha_vencimiento: nextDate,
      });

      cuotas.push(cuota);
      nextDate = casoService.calculateNextExpirationDate(
        nextDate,
        input.frecuencia_cobro
      );
    }

    let difference = input.cant_jus - jusCuota * input.num_cuotas;
    difference = parseFloat(difference.toFixed(3));
    cuotas[0].cant_jus += difference;

    return cuotas;
  },

  calculateNextExpirationDate: (date: string, frequency: string): string => {
    const utcDate = addHours(new Date(date), 3);
    let expirationDate: Date;

    switch (frequency) {
      case FrecuenciaPagoEnum.SEMANAL:
        expirationDate = addDays(utcDate, 7);
        break;
      case FrecuenciaPagoEnum.QUINCENAL:
        expirationDate = addDays(utcDate, 15);
        break;
      case FrecuenciaPagoEnum.MENSUAL:
        expirationDate = addMonths(utcDate, 1);
        break;
      case FrecuenciaPagoEnum.TRIMESTRAL:
        expirationDate = addMonths(utcDate, 3);
        break;
      case FrecuenciaPagoEnum.SEMESTRAL:
        expirationDate = addMonths(utcDate, 6);
        break;
      case FrecuenciaPagoEnum.ANUAL:
        expirationDate = addYears(utcDate, 1);
        break;
      default:
        throw new HttpError(400, `Frecuencia no válida: ${frequency}`);
    }

    return format(expirationDate, "yyyy-MM-dd");
  },
};
