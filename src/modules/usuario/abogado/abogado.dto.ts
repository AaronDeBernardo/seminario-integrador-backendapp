import { Abogado } from "./abogado.entity.js";
import { Rol } from "../rol/rol.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

export class AbogadoDTO {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string;
  tipo_doc: string;
  nro_doc: string;
  fecha_alta: string;
  foto: Buffer;
  matricula: string;
  rol: Rol;

  constructor(input: Abogado | Usuario) {
    if (input instanceof Abogado) {
      this.id = input.usuario.id;
      this.nombre = input.usuario.nombre;
      this.apellido = input.usuario.apellido;
      this.email = input.usuario.email;
      this.telefono = input.usuario.telefono;
      this.tipo_doc = input.usuario.tipo_doc;
      this.nro_doc = input.usuario.nro_doc;
      this.fecha_alta = input.usuario.fecha_alta;
      this.foto = input.foto;
      this.matricula = input.matricula;
      this.rol = input.rol;
    } else {
      this.id = input.id;
      this.nombre = input.nombre;
      this.apellido = input.apellido;
      this.email = input.email;
      this.telefono = input.telefono;
      this.tipo_doc = input.tipo_doc;
      this.nro_doc = input.nro_doc;
      this.fecha_alta = input.fecha_alta;
      this.foto = input.abogado!.foto;
      this.matricula = input.abogado!.matricula;
      this.rol = input.abogado!.rol;
    }
  }
}
