import { AbogadoCaso } from "./abogado-caso.entity.js";
import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { AbogadoDTO } from "../../usuario/abogado/abogado.dto.js";

export class AbogadoCasoDTO {
  id: number;
  abogado: AbogadoDTO | null;
  caso: CasoDTO | null;
  fecha_alta: string;
  fecha_baja?: string;

  constructor(input: AbogadoCaso) {
    this.id = input.id;
    this.abogado = input.abogado ? new AbogadoDTO(input.abogado) : null;
    this.caso = input.caso ? new CasoDTO(input.caso) : null;
    this.fecha_alta = input.fecha_alta;
    this.fecha_baja = input.fecha_baja;
  }
}
