import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "politicas" })
export class Politica {
  @PrimaryKey()
  id!: number;

  @Property()
  max_cuotas!: number;

  @Property()
  tam_max_archivo_mb!: number;
}
