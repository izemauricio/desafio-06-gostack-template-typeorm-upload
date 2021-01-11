import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @Column()
  category_id: string; // nossa chave estrangeira

  @ManyToOne(() => Category) // funcao que retorna o objeto Category
  @JoinColumn({ name: 'category_id' }) // diz qual coluna nessa tabela transaction que identifica o objeto category
  category: Category; // objeto category

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}

export default Transaction;
