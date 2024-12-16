import { Entity, OneToOne, Property, Rel } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity({ tableName: "secretarios" })
export class Secretario {
  @OneToOne(() => Usuario, {
    primary: true,
    fieldName: "id_usuario",
  })
  usuario!: Rel<Usuario>;

  @Property({ type: "varchar", length: 20 })
  turno_trabajo!: string;
}
