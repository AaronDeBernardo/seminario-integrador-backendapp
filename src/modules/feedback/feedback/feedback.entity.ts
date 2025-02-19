import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { IsNotEmpty } from "class-validator";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "feedbacks" })
export class Feedback {
  @ManyToOne(() => Abogado, {
    type: "int",
    primary: true,
    fieldName: "id_abogado",
  })
  abogado!: Rel<Abogado>;

  @ManyToOne(() => Caso, {
    type: "int",
    primary: true,
    fieldName: "id_caso",
  })
  caso!: Rel<Caso>;

  @Property({ type: "datetime", nullable: true })
  fecha_hora!: Date;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;

  @IsNotEmpty()
  @Property({ type: "int" })
  puntuacion!: number;
}
