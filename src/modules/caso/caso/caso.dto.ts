import { Caso } from "./caso.entity.js";
import { ClienteDTO } from "../../usuario/cliente/cliente.dto.js";
import { EspecialidadDTO } from "../../especialidad/especialidad/especialidad.dto.js";

export class CasoDTO {
  id: number;
  cliente: ClienteDTO | null;
  especialidad: EspecialidadDTO | null;
  fecha_inicio: string;
  descripcion: string;
  estado: string;
  fecha_estado: string;
  monto_caso: number | undefined;

  constructor(input: Caso) {
    this.id = input.id;
    this.cliente = input.cliente ? new ClienteDTO(input.cliente) : null;
    this.especialidad = input.especialidad
      ? new EspecialidadDTO(input.especialidad)
      : null;
    this.fecha_inicio = input.fecha_inicio;
    this.descripcion = input.descripcion;
    this.estado = input.estado;
    this.fecha_estado = input.fecha_estado;
    this.monto_caso = input.monto_caso || undefined;
  }
}
