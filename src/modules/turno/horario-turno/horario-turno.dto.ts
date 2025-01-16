import { HorarioTurno } from "./horario-turno.entity.js";

export class HorarioTurnoDTO {
  id: number;
  abogado: { id: number; nombre: string; apellido: string };
  hora_inicio: string;
  hora_fin: string;
  dia_semana: number;
  fecha_baja: string | undefined;

  constructor(input: HorarioTurno) {
    this.id = input.id;
    this.abogado = {
      id: input.abogado.usuario.id,
      nombre: input.abogado.usuario.nombre,
      apellido: input.abogado.usuario.apellido,
    };

    this.hora_inicio = input.hora_inicio.substring(0, 5);
    this.hora_fin = input.hora_fin.substring(0, 5);
    this.dia_semana = input.dia_semana;
    this.fecha_baja = input.fecha_baja || undefined;
  }
}
