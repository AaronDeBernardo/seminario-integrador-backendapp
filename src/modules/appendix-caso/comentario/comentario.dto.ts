import { Comentario } from "./comentario.entity.js";
import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { AbogadoDTO } from "../../usuario/abogado/abogado.dto.js";

export class ComentarioDTO {
  id: number;
  caso: CasoDTO | null;
  abogado: AbogadoDTO | null;
  padre: { id: number; comentario: string } | null;
  respuestas: Omit<ComentarioDTO, "respuestas" | "padre">[];
  fecha_hora: Date;
  comentario: string;

  constructor(input: Comentario) {
    this.id = input.id;
    this.caso = input.caso ? new CasoDTO(input.caso) : null;
    this.abogado = input.abogado ? new AbogadoDTO(input.abogado) : null;

    this.padre = input.padre
      ? { id: input.padre.id, comentario: input.padre.comentario }
      : null;

    this.respuestas = input.respuestas.isInitialized()
      ? input.respuestas.getItems().map(
          (respuesta) =>
            ({
              id: respuesta.id,
              fecha_hora: respuesta.fecha_hora,
              comentario: respuesta.comentario,
              abogado: respuesta.abogado
                ? new AbogadoDTO(respuesta.abogado)
                : null,
              caso: respuesta.caso ? new CasoDTO(respuesta.caso) : null, // ✅ Se agrega "caso"
            } as Omit<ComentarioDTO, "respuestas" | "padre">)
        )
      : [];

    this.fecha_hora = input.fecha_hora;
    this.comentario = input.comentario;
  }
}
