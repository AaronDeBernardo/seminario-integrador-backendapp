import { Comentario } from "./comentario.entity";

export interface ComentarioTreeDTO {
  id: number;
  abogado: {
    id: number;
    nombre: string;
    apellido: string;
  };
  comentario: string;
  fecha_hora: Date;
  respuestas: ComentarioTreeDTO[];
}

export const comentarioService = {
  makeCommentsTree: (comentarios: Comentario[]): ComentarioTreeDTO[] => {
    const mapa = new Map<number, ComentarioTreeDTO>();
    const raiz: ComentarioTreeDTO[] = [];

    for (const comentario of comentarios) {
      const dto: ComentarioTreeDTO = {
        id: comentario.id,
        comentario: comentario.comentario,
        fecha_hora: comentario.fecha_hora,
        abogado: {
          id: comentario.abogado.usuario.id,
          nombre: comentario.abogado.usuario.nombre,
          apellido: comentario.abogado.usuario.apellido,
        },
        respuestas: [],
      };
      mapa.set(comentario.id, dto);
    }

    for (const comentario of comentarios) {
      const dto = mapa.get(comentario.id)!;

      if (comentario.padre) {
        const dtoPadre = mapa.get(comentario.padre.id);
        if (dtoPadre) {
          dtoPadre.respuestas.push(dto);
        }
      } else {
        raiz.push(dto);
      }
    }

    return raiz;
  },
};
