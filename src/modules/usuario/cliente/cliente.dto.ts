import { Cliente } from "./cliente.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

export class ClienteDTO {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string;
  tipo_doc: string;
  nro_doc: string;
  fecha_alta: string;
  es_empresa: boolean;

  constructor(input: Cliente | Usuario) {
    if (input instanceof Cliente) {
      this.id = input.usuario.id;
      this.nombre = input.usuario.nombre;
      this.apellido = input.usuario.apellido;
      this.email = input.usuario.email;
      this.telefono = input.usuario.telefono;
      this.tipo_doc = input.usuario.tipo_doc;
      this.nro_doc = input.usuario.nro_doc;
      this.fecha_alta = input.usuario.fecha_alta;
      this.es_empresa = input.es_empresa;
    } else {
      this.id = input.id;
      this.nombre = input.nombre;
      this.apellido = input.apellido;
      this.email = input.email;
      this.telefono = input.telefono;
      this.tipo_doc = input.tipo_doc;
      this.nro_doc = input.nro_doc;
      this.fecha_alta = input.fecha_alta;
      this.es_empresa = input.cliente!.es_empresa;
    }
  }
}
