import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "comentarios" })
export class Comentario {
  @PrimaryKey({ type: "int" })
  id!: number;

  @ManyToOne(() => "Caso", { fieldName: "id_caso" })
  caso!: Rel<Caso>;

  @ManyToOne(() => Abogado, { fieldName: "id_abogado" })
  abogado!: Rel<Abogado>;

  @Property({ type: "datetime", nullable: true })
  fecha_hora!: Date;

  @NotEmptyAndMaxLength(65535, "comentario")
  @Property({ type: "text" })
  comentario!: string;

  @ManyToOne(() => Comentario, { nullable: true, fieldName: "id_padre" })
  padre?: Comentario;
}
