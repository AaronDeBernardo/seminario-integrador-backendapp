import { TurnoOtorgado } from "./turno-otorgado.entity";

export class TurnoOtorgadoDTO {
  id_turno_otorgado: number;
  abogado: { nombre: string; apellido: string };
  fecha_turno: string;
  hora_inicio: string;
  hora_fin: string;
  cliente: {
    id?: number;
    nombre: string;
    apellido?: string;
    email: string;
    telefono: string;
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
      id: input.cliente?.usuario.id,
      nombre: input.cliente?.usuario.nombre || input.nombre!,
      apellido: input.cliente?.usuario.apellido || undefined,
      email: input.cliente?.usuario.email || input.email!,
      telefono: input.cliente?.usuario.telefono || input.telefono!,
    };
  }
}
