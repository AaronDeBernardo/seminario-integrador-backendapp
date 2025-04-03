import { Actividad } from "./actividad.entity";
import { CostoActividad } from "../costo-actividad/costo-actividad.entity";

export class ActividadDTO {
  id: number;
  nombre: string;
  cant_jus: number;
  fecha_hora_desde: Date | undefined;
  precio_pesos: number | undefined;

  constructor(
    id: number,
    nombre: string,
    cant_jus: number,
    fecha_hora_desde?: Date,
    precio_pesos?: number
  ) {
    this.id = id;
    this.nombre = nombre;
    this.cant_jus = cant_jus;
    this.fecha_hora_desde = fecha_hora_desde;
    this.precio_pesos = precio_pesos;
  }

  static fromActividadAndCosto(
    actividad: Actividad,
    costo: CostoActividad
  ): ActividadDTO {
    return new ActividadDTO(actividad.id, actividad.nombre, costo.cant_jus);
  }

  static fromActividadAndCantJus(
    actividad: Actividad,
    cant_jus: number
  ): ActividadDTO {
    return new ActividadDTO(actividad.id, actividad.nombre, cant_jus);
  }

  static fromGetActividades(result: any): ActividadDTO {
    return new ActividadDTO(
      result.id,
      result.nombre,
      Number(result.cant_jus),
      new Date(result.fecha_hora_desde),
      Number(result.precio_pesos)
    );
  }
}
