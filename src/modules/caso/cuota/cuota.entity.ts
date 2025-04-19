import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Rel,
} from "@mikro-orm/core";
import { Caso } from "../caso/caso.entity.js";
import { FormaCobroEnum } from "../../../utils/enums.js";
import { NotEmptyAndMaxLength } from "../../../utils/validators.js";

@Entity({ tableName: "cuotas" })
@Index({ properties: ["caso", "fecha_vencimiento"] })
export class Cuota {
  @ManyToOne(() => Caso, {
    primary: true,
    fieldName: "id_caso",
  })
  caso!: Rel<Caso>;

  @PrimaryKey({ type: "int" })
  numero!: number;

  @Property({ type: "decimal" })
  cant_jus!: number;

  @Property({ type: "date" })
  fecha_vencimiento!: string;

  @Property({ type: "datetime", nullable: true })
  fecha_hora_cobro?: Date;

  @NotEmptyAndMaxLength(20, "forma_cobro")
  @Property({ type: "varchar", length: 20, nullable: true })
  forma_cobro?: FormaCobroEnum;
}
