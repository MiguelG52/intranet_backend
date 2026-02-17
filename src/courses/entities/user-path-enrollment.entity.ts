import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { CoursePath } from './course-path.entity';
import { User } from '../../users/entities/user.entity';

export enum PathEnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
}

@Entity('user_path_enrollment')
@Index(['userId', 'pathId'], { unique: true })
export class UserPathEnrollment {
  @PrimaryGeneratedColumn('uuid', { name: 'enrollment_id' })
  enrollmentId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'path_id', type: 'uuid' })
  pathId: string;

  @CreateDateColumn({
    name: 'assigned_at',
    type: 'timestamp with time zone',
  })
  assignedAt: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt: Date | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: PathEnrollmentStatus.ACTIVE,
  })
  status: PathEnrollmentStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CoursePath, (path) => path.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'path_id' })
  coursePath: CoursePath;
}
