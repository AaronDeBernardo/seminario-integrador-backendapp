import { Caso } from "./caso.entity.js";
import { ClienteDTO } from "../../usuario/cliente/cliente.dto.js";
import { Cuota } from "../cuota/cuota.entity.js";
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
  cuotas:
    | {
        numero: number;
        cant_jus: number;
        fecha_vencimiento: string;
        fecha_hora_cobro: Date | undefined;
        forma_cobro: string | undefined;
      }[]
    | undefined;

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

  static fromCaso(caso: Caso): CasoDTO {
    return new CasoDTO(caso);
  }

  static fromCasoAndCuotas(caso: Caso, cuotas: Cuota[]): CasoDTO {
    const dto = new CasoDTO(caso);

    cuotas.forEach((cuota) => {
      dto.cuotas?.push({
        numero: cuota.numero,
        cant_jus: cuota.cant_jus,
        fecha_vencimiento: cuota.fecha_vencimiento,
        fecha_hora_cobro: cuota.fecha_hora_cobro,
        forma_cobro: cuota.forma_cobro,
      });
    });

    return dto;
  }
}
