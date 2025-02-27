import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";

@Entity({ tableName: "especialidades" })
export class Especialidad {
  @PrimaryKey({ type: "int" })
  id!: number;

  @Property({ type: "varchar", length: 20 })
  nombre!: string;

  @ManyToMany(() => Abogado, (abogado) => abogado.especialidades, {
    pivotEntity: "AbogadoEspecialidad",
  })
  abogados = new Collection<Abogado>(this);
}
