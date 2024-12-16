import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "reseteos_claves" })
export class ReseteoClave {
  @PrimaryKey({ type: "int" })
  id_usuario!: number;

  @PrimaryKey({ type: "datetime" })
  fecha_hora!: Date;

  @Property({ type: "varchar", length: 72 })
  codigo!: string;

  @Property({ type: "boolean", default: false })
  utilizado!: boolean;
}
