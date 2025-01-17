import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { AbogadoEspecialidad } from "../abogado-especialidad/abogado-especialidad.entity.js";

@Entity({ tableName: "especialidades" })
export class Especialidad {
  @PrimaryKey({ type: "int" })
  id!: number;

  @Property({ type: "varchar", length: 20 })
  nombre!: string;

  @OneToMany(
    () => AbogadoEspecialidad,
    (abogadoEspecialidad) => abogadoEspecialidad.especialidad
  )
  abogados = new Collection<AbogadoEspecialidad>(this);
}
