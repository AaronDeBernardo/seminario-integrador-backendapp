import { format } from "date-fns";
import { HorarioTurno } from "./horario-turno.entity.js";

export class HorarioTurnoDTO {
  id: number;
  abogado: { nombre: string; apellido: string };
  hora_inicio: string;
  hora_fin: string;
  dia_semana: number;
  fecha_baja: string | undefined;

  constructor(input: HorarioTurno) {
    this.id = input.id;
    this.abogado = {
      nombre: input.abogado.usuario.nombre,
      apellido: input.abogado.usuario.apellido,
    };
    this.hora_inicio = input.hora_inicio;
    this.hora_fin = input.hora_fin;
    this.dia_semana = input.dia_semana;

    if (input.fecha_baja != null)
      this.fecha_baja = format(input.fecha_baja, "yyyy-MM-dd");
  }
}
