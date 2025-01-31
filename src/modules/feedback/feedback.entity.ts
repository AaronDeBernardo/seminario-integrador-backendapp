import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { NotEmptyAndMaxLength } from "../../utils/validators.js";
import { Cliente } from "../usuario/cliente/cliente.entity.js";
import { Abogado } from "../usuario/abogado/abogado.entity.js";

@Entity({ tableName: "feedbacks" })
export class Feedback {
  @ManyToOne(() => Cliente, {
    primary: true,
    fieldName: "id_cliente",
  })
  cliente!: Rel<Cliente>;

  @ManyToOne(() => Abogado, {
    primary: true,
    fieldName: "id_abogado",
  })
  abogado!: Rel<Abogado>;

  @Property({ type: "datetime" })
  fecha_hora!: Date;

  @NotEmptyAndMaxLength(65535, "descripcion")
  @Property({ type: "text" })
  descripcion!: string;

  @Property({ type: "int" })
  puntuacion!: number;
}
