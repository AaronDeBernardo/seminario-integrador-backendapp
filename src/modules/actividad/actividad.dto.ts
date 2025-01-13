import { Actividad } from "./actividad.entity";
import { CostoActividad } from "./costo-actividad.entity";

export class ActividadDTO {
  id: number;
  nombre: string;
  cant_jus: number;
  precio_pesos: number | undefined;

  constructor(actividad: Actividad, costo: CostoActividad) {
    this.id = actividad.id;
    this.nombre = actividad.nombre;
    this.cant_jus = costo.cant_jus;
  }
}
