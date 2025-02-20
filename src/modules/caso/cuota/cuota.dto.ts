import { Cuota } from "./cuota.entity.js";

export class CuotaDTO {
  numero: number;
  cant_jus: number;
  precio_pesos: number | undefined;
  fecha_vencimiento: string;
  fecha_hora_cobro: Date | undefined;
  forma_cobro: string | undefined;

  caso:
    | {
        id: number;
        fecha_fin: string;
        descripcion: string;
        cliente: { id: number; nombre: string; apellido: string | undefined };
        especialidad: { id: number; nombre: string };
      }
    | undefined;

  constructor(input: Cuota, includeCaso: boolean, precio_pesos?: number) {
    this.numero = input.numero;
    this.cant_jus = input.cant_jus;
    this.precio_pesos = precio_pesos;
    this.fecha_vencimiento = input.fecha_vencimiento;
    this.fecha_hora_cobro = input.fecha_hora_cobro;
    this.forma_cobro = input.forma_cobro;

    if (includeCaso)
      this.caso = {
        id: input.caso.id,
        fecha_fin: input.caso.fecha_estado,
        descripcion: input.caso.descripcion,

        cliente: {
          id: input.caso.cliente.usuario.id,
          nombre: input.caso.cliente.usuario.nombre,
          apellido: input.caso.cliente.usuario.apellido,
        },

        especialidad: {
          id: input.caso.especialidad.id,
          nombre: input.caso.especialidad.nombre,
        },
      };
  }
}
