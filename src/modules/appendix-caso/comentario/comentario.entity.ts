import { Abogado } from "../../usuario/abogado/abogado.entity.js";

import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Rel,
} from "@mikro-orm/core";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "comentarios" })
export class Comentario {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => "Caso", { fieldName: "id_caso" })
  caso!: any;

  @ManyToOne(() => Abogado, { fieldName: "id_abogado" })
  abogado!: Rel<Abogado>;

  @ManyToOne(() => Comentario, { nullable: true, fieldName: "id_padre" })
  padre?: Comentario;

  @OneToMany(() => Comentario, (comentario) => comentario.padre)
  respuestas = new Collection<Comentario>(this);

  @Property({ type: "datetime" })
  fecha_hora!: Date;

  @NotEmptyAndMaxLength(65535, "comentario")
  @Property({ type: "text" })
  comentario!: string;
}
