import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "./caso.entity.js";
import { ClienteDTO } from "../../usuario/cliente/cliente.dto.js";
import { Cuota } from "../cuota/cuota.entity.js";
import { EspecialidadDTO } from "../../especialidad/especialidad/especialidad.dto.js";

export class CasoDTO {
  id: number;
  cliente?: ClienteDTO;
  especialidad?: EspecialidadDTO;
  fecha_inicio: string;
  descripcion: string;
  estado: string;
  fecha_estado: string;
  abogado_principal?: { id: number; nombre: string; apellido: string } | string;

  monto_jus?: number;
  deuda_jus?: number;

  cuotas?: {
    numero: number;
    cant_jus: number;
    fecha_vencimiento: string;
    fecha_hora_cobro: Date | undefined;
    forma_cobro: string | undefined;
  }[];

  constructor(
    input: Caso,
    abogado_principal?: Abogado,
    incluir_abogado_principal: boolean = false
  ) {
    this.id = input.id;
    this.cliente = input.cliente ? new ClienteDTO(input.cliente) : undefined;
    this.especialidad = input.especialidad
      ? new EspecialidadDTO(input.especialidad)
      : undefined;
    this.fecha_inicio = input.fecha_inicio;
    this.descripcion = input.descripcion;
    this.estado = input.estado;
    this.fecha_estado = input.fecha_estado;
    this.monto_jus = input.monto_jus || undefined;
    this.deuda_jus = input.deuda_jus || undefined;

    if (abogado_principal) {
      this.abogado_principal = {
        id: abogado_principal.usuario.id,
        nombre: abogado_principal.usuario.nombre,
        apellido: abogado_principal.usuario.apellido,
      };
    } else {
      this.abogado_principal = incluir_abogado_principal
        ? "El abogado principal fue eliminado."
        : undefined;
    }
  }

  static fromCaso(
    caso: Caso,
    abogado_principal?: Abogado,
    incluir_abogado_principal: boolean = false
  ): CasoDTO {
    return new CasoDTO(caso, abogado_principal, incluir_abogado_principal);
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
