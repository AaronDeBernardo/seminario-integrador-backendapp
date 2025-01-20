import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "precios_jus" })
export class PrecioJus {
  @PrimaryKey({ type: "date" })
  fecha_hora_desde!: Date;

  @Property({ type: "decimal", precision: 9, scale: 3 })
  valor!: number;
}
