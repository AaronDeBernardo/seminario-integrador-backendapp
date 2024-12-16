import { Entity, OneToOne, Property, Rel } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity({ tableName: "clientes" })
export class Cliente {
  @OneToOne(() => Usuario, {
    primary: true,
    fieldName: "id_usuario",
  })
  usuario!: Rel<Usuario>;

  @Property({ type: "boolean" })
  es_empresa!: boolean;
}
