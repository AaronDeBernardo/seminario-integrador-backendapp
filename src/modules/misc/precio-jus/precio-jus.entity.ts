import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class PrecioJus {
    @PrimaryKey()
    fecha_hora_desde: Date = new Date();

    @Property({ type: 'decimal', precision: 9, scale: 3 })
    valor: number = 0;
}