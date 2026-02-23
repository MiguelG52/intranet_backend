import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('vacation_balance')
export class VacationBalance {
  @PrimaryGeneratedColumn('uuid', { name: 'balance_id' })
  balanceId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'days_granted', type: 'int' })
  daysGranted: number;

  @Column({ name: 'days_used', type: 'decimal', precision: 5, scale: 2, default: 0 })
  daysUsed: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relación con User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
