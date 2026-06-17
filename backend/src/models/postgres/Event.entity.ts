import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events', schema: 'public' })
export class EventEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  eventName!: string;

  @Column({ name: 'qty_rows', type: 'int' })
  mapRows!: number;

  @Column({ name: 'qty_columns', type: 'int' })
  mapCols!: number;

  @Column({ name: 'base_width', type: 'int', default: 55 })
  baseWidth!: number;

  @Column({ name: 'base_height', type: 'int', default: 60 })
  baseHeight!: number;

  @Column({ name: 'scale_increment', type: 'float', default: 0.03 })
  scaleIncrement!: number;

  @Column({ name: 'svg_scale', type: 'float', default: 0.9 })
  svgScale!: number;

  @Column({ name: 'max_offset_x', type: 'int', default: 10 })
  maxOffsetX!: number;

  @Column({ name: 'max_offset_y', type: 'int', default: 10 })
  maxOffsetY!: number;

  @Column({ name: 'price_s', type: 'float', default: 0.0 })
  priceS!: number;

  @Column({ name: 'price_d', type: 'float', default: 0.0 })
  priceD!: number;

  @Column({ name: 'place_holders', type: 'jsonb', default: [] })
  placeholders!: { linha: number; coluna: number }[];

  @Column({ name: 'status', type: 'varchar', length: 255 })
  status!: string;

  @Column({ name: 'svg_url', type: 'varchar', length: 255 })
  svgUrl!: string;


}
 
