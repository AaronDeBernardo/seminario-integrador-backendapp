import { Comentario } from "./comentario.entity.js";

export class ComentarioDTO {
  id: number;
  abogado: { nombre: string; apellido: string } | undefined;
  padre: { id: number; comentario: string } | null;
  respuestas: RespuestaDTO[];
  fecha_hora: Date;
  comentario: string;

  constructor(input: Comentario) {
    this.id = input.id;

    if (input.abogado) {
      this.abogado = {
        nombre: input.abogado.usuario.nombre,
        apellido: input.abogado.usuario.apellido,
      };
    } else {
      this.abogado = undefined;
    }

    this.padre = input.padre
      ? { id: input.padre.id, comentario: input.padre.comentario }
      : null;

    this.respuestas = input.respuestas.isInitialized()
      ? input.respuestas.getItems().map((respuesta) => ({
          id: respuesta.id,
          fecha_hora: respuesta.fecha_hora,
          comentario: respuesta.comentario,
          abogado: respuesta.abogado
            ? {
                nombre: respuesta.abogado.usuario.nombre,
                apellido: respuesta.abogado.usuario.apellido,
              }
            : null,
        }))
      : [];

    this.fecha_hora = input.fecha_hora;
    this.comentario = input.comentario;
  }
}

// Tipo auxiliar para asegurar la estructura correcta de respuestas
type RespuestaDTO = {
  id: number;
  fecha_hora: Date;
  comentario: string;
  abogado: { nombre: string; apellido: string } | null;
};
