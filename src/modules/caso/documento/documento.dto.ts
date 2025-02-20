import { Documento } from "./documento.entity.js";

export class DocumentoDTO {
  id: number;
  nombre: string;
  archivo: Buffer | undefined;
  fecha_carga: string;

  caso: { especialidad: string; descripcion: string } | undefined;
  cliente: { id: number; nombre: string; apellido: string } | undefined;

  constructor(input: Documento, includesCaso: boolean) {
    this.id = input.id;
    this.nombre = input.nombre;
    this.archivo = input.archivo;
    this.fecha_carga = input.fecha_carga;

    if (includesCaso) {
      this.caso = {
        especialidad: input.caso.especialidad.nombre,
        descripcion: input.caso.descripcion,
      };

      this.cliente = {
        id: input.caso.cliente.usuario.id,
        nombre: input.caso.cliente.usuario.nombre,
        apellido: input.caso.cliente.usuario.apellido,
      };
    }
  }
}
