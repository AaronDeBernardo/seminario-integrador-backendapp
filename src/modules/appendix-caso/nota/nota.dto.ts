import { Nota } from "./nota.entity.js";

export class NotaDTO {
  abogado: { nombre: string; apellido: string } | undefined;
  caso:
    | {
        id: number;
        descripcion: string;
        especialidad: string;
        cliente: { nombre: string; apellido: string | undefined };
      }
    | undefined;
  fecha_hora: Date;
  titulo: string;
  descripcion: string;

  constructor(input: Nota) {
    if (input.abogado.matricula) {
      this.abogado = {
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
    this.fecha_hora = input.fecha_hora;
    this.titulo = input.titulo;
    this.descripcion = input.descripcion;
  }
}
