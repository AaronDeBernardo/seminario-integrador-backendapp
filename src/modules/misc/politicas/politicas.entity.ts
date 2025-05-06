import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "politicas" })
export class Politicas {
  @PrimaryKey()
  id!: number;

  @Property()
  max_cuotas!: number;

  @Property()
  tam_max_foto_usuario_mb!: number;

  @Property()
  tam_max_documento_mb!: number;
}
