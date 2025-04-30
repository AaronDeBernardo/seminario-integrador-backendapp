import { Comentario } from "./comentario.entity.js";

export class ComentarioDTO {
  id: number;
  abogado?: { id: number; nombre: string; apellido: string };
  padre?: { id: number; comentario: string };
  fecha_hora: Date;
  comentario: string;

  constructor(input: Comentario) {
    this.id = input.id;

    if (input.abogado) {
      this.abogado = {
        id: input.abogado.usuario.id,
        nombre: input.abogado.usuario.nombre,
        apellido: input.abogado.usuario.apellido,
      };
    }

    this.padre = input.padre
      ? { id: input.padre.id, comentario: input.padre.comentario }
      : undefined;

    this.fecha_hora = input.fecha_hora;
    this.comentario = input.comentario;
  }
}
