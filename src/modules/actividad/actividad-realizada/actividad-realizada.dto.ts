import { ActividadRealizada } from "./actividad-realizada.entity";

export class ActividadRealizadaDTO {
  id: number;
  fecha_hora: Date;
  actividad: { id: number; nombre: string };
  abogado: { id: number; nombre: string; apellido: string } | undefined;
  cliente: {
    id: number;
    nombre: string;
    apellido: string | undefined;
  };

  constructor(input: ActividadRealizada, includeAbogado: boolean) {
    this.id = input.id;
    this.fecha_hora = input.fecha_hora;

    this.actividad = {
      id: input.actividad.id,
      nombre: input.actividad.nombre,
    };

    if (includeAbogado) {
      this.abogado = {
        id: input.abogado.usuario.id,
        nombre: input.abogado.usuario.nombre,
        apellido: input.abogado.usuario.apellido,
      };
    }

    this.cliente = {
      id: input.cliente.usuario.id,
      nombre: input.cliente.usuario.nombre,
      apellido: input.cliente.usuario.apellido || undefined,
    };
  }
}
