import { RolEnum, TipoUsuarioEnum } from "../../utils/enums.js";
import { Usuario } from "../usuario/usuario/usuario.entity.js";

export class UsuarioSesion {
  is_admin!: boolean;
  tipo_usuario!: TipoUsuarioEnum;

  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tipo_doc: string;
  nro_doc: string;
  fecha_alta: string;

  foto?: Buffer;
  matricula?: string;
  turno_trabajo?: string;
  es_empresa?: boolean;

  constructor(usuario: Usuario) {
    this.id = usuario.id;
    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.email = usuario.email;
    this.telefono = usuario.telefono;
    this.tipo_doc = usuario.tipo_doc;
    this.nro_doc = usuario.nro_doc;
    this.fecha_alta = usuario.fecha_alta;

    if (usuario.abogado) {
      this.is_admin = usuario.abogado.rol.nombre === RolEnum.ADMIN;
      this.tipo_usuario = TipoUsuarioEnum.ABOGADO;
      this.foto = usuario.abogado.foto;
      this.matricula = usuario.abogado.matricula;
    } else if (usuario.secretario) {
      this.is_admin = true;
      this.tipo_usuario = TipoUsuarioEnum.SECRETARIO;
      this.turno_trabajo = usuario.secretario.turno_trabajo;
    } else if (usuario.cliente) {
      this.is_admin = false;
      this.tipo_usuario = TipoUsuarioEnum.CLIENTE;
      this.es_empresa = usuario.cliente.es_empresa;
    }
  }
}
