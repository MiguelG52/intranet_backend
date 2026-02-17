import { Position } from 'src/organization/positions/entities/position.entity'; // Ajusta la ruta
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from './user.entity'; // Ajusta la ruta

@Entity({ name: 'user_position' })
export class UserPosition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'position_id' })
  positionId: string;

  // --- Relaciones ---

  @ManyToOne(() => User, (user) => user.userPositions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Position, (position) => position.userPositions)
  @JoinColumn({ name: 'position_id' })
  position: Position;
}