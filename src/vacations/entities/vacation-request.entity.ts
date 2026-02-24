import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { VacationStatus } from '../enums/vacation-status.enum';
import { User } from 'src/users/entities/user.entity';

@Entity('vacation_request')
export class VacationRequest {
  @PrimaryGeneratedColumn('uuid', {
    name: 'request_id',
  })
  requestId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'requested_days', type: 'decimal', precision: 5, scale: 2 })
  requestedDays: number;

  @Column({ 
    type: 'enum', 
    enum: VacationStatus, 
    default: VacationStatus.PENDING 
  })
  status: VacationStatus;

  @Column({ name: 'reviewer_id', type: 'uuid', nullable: true })
  reviewerId: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  // Relación con el usuario que solicita
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación con el revisor (manager/RRHH)
  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: any;
}
