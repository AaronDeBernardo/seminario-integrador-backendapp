import { AbogadoDTO } from "../usuario/abogado/abogado.dto.js";
import { ClienteDTO } from "../usuario/cliente/cliente.dto.js";
import { Feedback } from "./feedback.entity.js";

export class FeedbackDTO {
  cliente: ClienteDTO;
  abogado: AbogadoDTO;
  fecha_hora: string;
  descripcion: string;
  puntuacion: number;

  constructor(input: Feedback) {
    this.cliente = new ClienteDTO(input.cliente);
    this.abogado = new AbogadoDTO(input.abogado);
    this.fecha_hora = input.fecha_hora.toISOString();
    this.descripcion = input.descripcion;
    this.puntuacion = input.puntuacion;
  }
}
