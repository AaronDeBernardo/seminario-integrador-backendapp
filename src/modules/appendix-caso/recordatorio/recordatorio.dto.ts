import { AbogadoDTO } from "../../usuario/abogado/abogado.dto.js";
import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { Recordatorio } from "./recordatorio.entity.js";

export class RecordatorioDTO {
  id: number;
  caso: CasoDTO | null;
  abogado: AbogadoDTO | null;
  descripcion: string;
  fecha_hora_limite: string;

  constructor(input: Recordatorio) {
    this.id = input.id;
    this.caso = input.caso ? new CasoDTO(input.caso) : null;
    this.abogado = input.abogado ? new AbogadoDTO(input.abogado) : null;
    this.descripcion = input.descripcion;
    this.fecha_hora_limite = input.fecha_hora_limite.toISOString();
  }
}
