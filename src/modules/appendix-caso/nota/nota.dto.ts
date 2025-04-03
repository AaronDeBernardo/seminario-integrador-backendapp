import { Nota } from "./nota.entity.js";

export class NotaDTO {
  id: number;
  fecha_hora: Date;
  titulo: string;
  descripcion: string;

  abogado?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  caso?: {
    id: number;
    descripcion: string;
    especialidad: string;
    cliente: { nombre: string; apellido?: string };
  };

  constructor(input: Nota) {
    this.id = input.id;
    this.fecha_hora = input.fecha_hora;
    this.titulo = input.titulo;
    this.descripcion = input.descripcion;

    if (input.abogado.matricula) {
      this.abogado = {
        id: input.abogado.usuario.id,
        nombre: input.abogado.usuario.nombre,
        apellido: input.abogado.usuario.apellido,
      };
    }

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
