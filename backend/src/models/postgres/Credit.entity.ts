import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'credits', schema: 'public' })
export class CreditEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Index()
  @Column({ name: 'codigo_lote', type: 'varchar', length: 255 })
  codigoLote!: string;

  @Column({ name: 'qty_credits', type: 'int' })
  qtyCredits!: number;

  @Column({ name: 'must_pay', type: 'int' })
  mustPay!: number;
}
