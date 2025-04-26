import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Abogado } from "../abogado/abogado.entity.js";
import { RolEnum } from "../../../utils/enums.js";

@Entity({ tableName: "roles" })
export class Rol {
  @PrimaryKey({ type: "int" })
  id!: number;

  @Property({ type: "varchar", length: 20 })
  nombre!: RolEnum;

  @OneToMany({
    entity: () => Abogado,
    mappedBy: "rol",
  })
  abogados = new Collection<Abogado>(this);
}
