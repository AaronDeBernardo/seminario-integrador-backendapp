import { Abogado } from "./abogado.entity.js";
import { Especialidad } from "../../especialidad/especialidad/especialidad.entity.js";
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
  foto?: Buffer;
  matricula: string;
  rol: Rol;
  especialidades: Especialidad[] | null;

  constructor(input: Abogado | Usuario, includeFoto: boolean) {
    if (input instanceof Abogado) {
      this.id = input.usuario.id;
      this.nombre = input.usuario.nombre;
      this.apellido = input.usuario.apellido;
      this.email = input.usuario.email;
      this.telefono = input.usuario.telefono;
      this.tipo_doc = input.usuario.tipo_doc;
      this.nro_doc = input.usuario.nro_doc;
      this.fecha_alta = input.usuario.fecha_alta;
      this.foto = includeFoto ? input.foto : undefined;
      this.matricula = input.matricula;
      this.rol = input.rol;
      this.especialidades = input.especialidades.getItems();
    } else {
      this.id = input.id;
      this.nombre = input.nombre;
      this.apellido = input.apellido;
      this.email = input.email;
      this.telefono = input.telefono;
      this.tipo_doc = input.tipo_doc;
      this.nro_doc = input.nro_doc;
      this.fecha_alta = input.fecha_alta;
      this.foto = includeFoto ? input.abogado!.foto : undefined;
      this.matricula = input.abogado!.matricula;
      this.rol = input.abogado!.rol;
      this.especialidades = input.abogado!.especialidades.getItems();
    }
  }
}
