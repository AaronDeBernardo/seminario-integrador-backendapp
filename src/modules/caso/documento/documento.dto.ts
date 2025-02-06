import { CasoDTO } from "../../caso/caso/caso.dto.js";
import { Documento } from "./documento.entity.js";

export class DocumentoDTO {
  caso: CasoDTO;
  id: number;
  nombre: string;
  archivo: Buffer;
  fecha_carga: string;
  fecha_baja?: string;

  constructor(input: Documento) {
    this.caso = new CasoDTO(input.caso);
    this.id = input.id;
    this.nombre = input.nombre;
    this.archivo = input.archivo;
    this.fecha_carga = input.fecha_carga;
    this.fecha_baja = input.fecha_baja;
  }
}
