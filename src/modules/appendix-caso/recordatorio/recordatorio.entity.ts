import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Abogado } from "../../usuario/abogado/abogado.entity.js";
import { Caso } from "../../caso/caso/caso.entity.js";
import { IsNotEmpty } from "class-validator";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "recordatorios" })
export class Recordatorio {
  @PrimaryKey({ type: "int", autoincrement: true })
  id!: number;

  @ManyToOne(() => "Caso", { fieldName: "id_caso" })
  caso!: Rel<Caso>;

  @ManyToOne(() => Abogado, { fieldName: "id_abogado" })
  abogado!: Rel<Abogado>;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;

  @IsNotEmpty({ message: "fecha_hora_limite: atributo faltante." })
  @Property({ type: "datetime" })
  fecha_hora_limite!: Date;
}
