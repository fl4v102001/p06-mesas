import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'seats', schema: 'public' })
export class SeatEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'id_event', type: 'int' })
  idEvent!: number;

  @Index()
  @Column({ name: 'seat_name', type: 'varchar', length: 255 })
  nome!: string;

  @Column({ name: 'seat_row', type: 'int' })
  linha!: number;

  @Column({ name: 'seat_column', type: 'int' })
  coluna!: number;

  @Column({ name: 'seat_type', type: 'varchar', length: 255, default: 'mesa-4' })
  tipo!: string;

  @Column({ name: 'price', type: 'int', default: 50 })
  price!: number;

  @Column({ name: 'status', type: 'varchar', length: 255, nullable: true, default: 'livre' })
  status!: string | null;

  @Column({ name: 'owner_codigo_lote', type: 'varchar', length: 255, nullable: true })
  ownerId!: string | null;
}
