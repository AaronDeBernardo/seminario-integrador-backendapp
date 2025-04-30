import { Recordatorio } from "./recordatorio.entity.js";

export class RecordatorioDTO {
  id: number;
  abogado?: { id: number; nombre: string; apellido: string };
  descripcion: string;
  fecha_hora_limite: Date;
  caso?: {
    id: number;
    descripcion: string;
    especialidad: string;
    cliente: { nombre: string; apellido?: string };
  };

  constructor(input: Recordatorio) {
    this.id = input.id;
    if (input.abogado.matricula) {
      this.abogado = {
        id: input.abogado.usuario.id,
        nombre: input.abogado.usuario.nombre,
        apellido: input.abogado.usuario.apellido,
      };
    }

    this.descripcion = input.descripcion;
    this.fecha_hora_limite = input.fecha_hora_limite;

    if (input.caso.descripcion) {
      this.caso = {
        id: input.caso.id,
        descripcion: input.caso.descripcion,
        especialidad: input.caso.especialidad.nombre,
        cliente: {
          nombre: input.caso.cliente.usuario.nombre,
          apellido: input.caso.cliente.usuario.apellido,
        },
      };
    }
  }
}
