import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { generateRandomCode } from "../../../utils/randome-code.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity({ tableName: "reseteos_claves" })
export class ReseteoClave {
  @ManyToOne(() => Usuario, { primary: true, fieldName: "id_usuario" })
  usuario!: Usuario;

  @PrimaryKey({ type: "datetime", nullable: true })
  fecha_hora?: Date;

  @Property({ type: "varchar", length: 72 })
  codigo? = generateRandomCode(20);

  @Property({ type: "boolean", default: false })
  utilizado?: boolean = false;
}
