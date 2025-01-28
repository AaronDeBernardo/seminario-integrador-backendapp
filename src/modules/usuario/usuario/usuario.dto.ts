import { Usuario } from "../usuario/usuario.entity.js";

export class UsuarioDTO {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string;
  tipo_doc: string;
  nro_doc: string;
  fecha_alta: string;
  fecha_baja: string | undefined;

  constructor(input: Usuario) {
    this.id = input.id;
    this.nombre = input.nombre;
    this.apellido = input.apellido;
    this.email = input.email;
    this.telefono = input.telefono;
    this.tipo_doc = input.tipo_doc;
    this.nro_doc = input.nro_doc;
    this.fecha_alta = input.fecha_alta;
    this.fecha_baja = input.fecha_baja;
  }
}
