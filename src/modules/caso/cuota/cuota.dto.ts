import { Caso } from "../caso/caso.entity.js";
import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { Cuota } from "./cuota.entity.js";

export class CuotaDTO {
  private static casoDTOMap = new WeakMap<Caso, CasoDTO>();
  caso: { id: number } | CasoDTO;
  numero: number;
  cant_jus: number;
  fecha_vencimiento: string;
  fecha_hora_cobro: Date | undefined;
  forma_cobro: string | undefined;

  constructor(input: Cuota, forceShowCaso: boolean = false) {
    let casoDTO = CuotaDTO.casoDTOMap.get(input.caso);
    if (!casoDTO) {
      casoDTO = new CasoDTO(input.caso);
      CuotaDTO.casoDTOMap.set(input.caso, casoDTO);
    }

    this.caso =
      forceShowCaso || input.numero === 1 ? casoDTO : { id: input.caso.id };
    this.numero = input.numero;
    this.cant_jus = input.cant_jus;
    this.fecha_vencimiento = input.fecha_vencimiento;
    this.fecha_hora_cobro = input.fecha_hora_cobro;
    this.forma_cobro = input.forma_cobro;
  }
}
