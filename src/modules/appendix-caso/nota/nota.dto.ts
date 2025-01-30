import { AbogadoDTO } from "../../usuario/abogado/abogado.dto.js";
import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { Nota } from "./nota.entity.js";

export class NotaDTO {
  abogado: AbogadoDTO | null;
  caso: CasoDTO | null;
  fecha_hora: string;
  titulo: string;
  descripcion: string;

  constructor(input: Nota) {
    this.abogado = input.abogado ? new AbogadoDTO(input.abogado) : null;
    this.caso = input.caso ? new CasoDTO(input.caso) : null;
    this.fecha_hora = input.fecha_hora.toISOString();
    this.titulo = input.titulo;
    this.descripcion = input.descripcion;
  }
}
