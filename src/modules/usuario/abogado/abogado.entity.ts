import { Entity, ManyToOne, OneToOne, Property, Rel } from "@mikro-orm/core";
import { Rol } from "../rol/rol.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity({ tableName: "abogados" })
export class Abogado {
  @OneToOne(() => Usuario, {
    primary: true,
    fieldName: "id_usuario",
  })
  usuario!: Rel<Usuario>;

  @Property({ type: "blob" })
  foto!: Buffer;

  @Property({ type: "varchar", length: 20 })
  matricula!: string;

  @ManyToOne(() => Rol, { fieldName: "id_rol" })
  rol!: Rol;
}
