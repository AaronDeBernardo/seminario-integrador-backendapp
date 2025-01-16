import { TurnoOtorgado } from "./turno-otorgado.entity";

export class TurnoOtorgadoDTO {
  id_turno_otorgado: number;
  abogado: { nombre: string; apellido: string };
  fecha_turno: string;
  hora_inicio: string;
  hora_fin: string;
  cliente: {
    nombre: string;
    apellido: string | undefined;
    id: number;
  };

  constructor(input: TurnoOtorgado) {
    this.id_turno_otorgado = input.id;
    this.abogado = {
      nombre: input.horarioTurno.abogado.usuario.nombre,
      apellido: input.horarioTurno.abogado.usuario.apellido,
    };
    this.fecha_turno = input.fecha_turno;
    this.hora_inicio = input.horarioTurno.hora_inicio;
    this.hora_fin = input.horarioTurno.hora_fin;
    this.cliente = {
      id: input.cliente?.usuario.id || 0, // 0 si el cliente no se encuentra registrado
      nombre: input.cliente?.usuario.nombre || (input.nombre as string),
      apellido: input.cliente?.usuario.apellido || undefined,
    };
  }
}
