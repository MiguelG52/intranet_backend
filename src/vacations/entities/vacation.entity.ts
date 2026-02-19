import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vacation')
export class Vacation {
  @PrimaryColumn({
    type: 'uuid',
    name: 'vacation_id',
    default: () => 'gen_random_uuid()',
  })
  vacationId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'total_days', type: 'int', default: 0 })
  totalDays: number;

  @Column({ name: 'used_days', type: 'int', default: 0 })
  usedDays: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
