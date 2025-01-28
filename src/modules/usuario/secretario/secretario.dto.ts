import { Usuario } from "../usuario/usuario.entity.js";
import { Secretario } from "./secretario.entity.js";

export class SecretarioDTO {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string;
  tipo_doc: string;
  nro_doc: string;
  fecha_alta: string;
  turno_trabajo: string;

  constructor(input: Secretario | Usuario) {
    if (input instanceof Secretario) {
      this.id = input.usuario.id;
      this.nombre = input.usuario.nombre;
      this.apellido = input.usuario.apellido;
      this.email = input.usuario.email;
      this.telefono = input.usuario.telefono;
      this.tipo_doc = input.usuario.tipo_doc;
      this.nro_doc = input.usuario.nro_doc;
      this.fecha_alta = input.usuario.fecha_alta;
      this.turno_trabajo = input.turno_trabajo;
    } else {
      this.id = input.id;
      this.nombre = input.nombre;
      this.apellido = input.apellido;
      this.email = input.email;
      this.telefono = input.telefono;
      this.tipo_doc = input.tipo_doc;
      this.nro_doc = input.nro_doc;
      this.fecha_alta = input.fecha_alta;
      this.turno_trabajo = input.secretario!.turno_trabajo;
    }
  }
}
