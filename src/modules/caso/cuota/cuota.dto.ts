import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { Cuota } from "./cuota.entity.js";

export class CuotaDTO {
  static casoDTOCache: CasoDTO | null = null;
  caso: CasoDTO | null;
  numero: number;
  cant_jus: number;
  fecha_vencimiento: string;
  fecha_hora_cobro: Date | undefined;
  forma_cobro: string | undefined;

  constructor(input: Cuota, forceShowCaso: boolean = false) {
    if (!CuotaDTO.casoDTOCache) {
      CuotaDTO.casoDTOCache = new CasoDTO(input.caso);
    }

    this.caso =
      forceShowCaso || input.numero === 1 ? CuotaDTO.casoDTOCache : null;
    this.numero = input.numero;
    this.cant_jus = input.cant_jus;
    this.fecha_vencimiento = input.fecha_vencimiento;
    this.fecha_hora_cobro = input.fecha_hora_cobro;
    this.forma_cobro = input.forma_cobro;
  }
}
