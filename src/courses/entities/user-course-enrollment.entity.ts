import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Course } from './course.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_course_enrollment')
@Index(['userId', 'courseId'], { unique: true })
export class UserCourseEnrollment {
  @PrimaryGeneratedColumn('uuid', { name: 'enrollment_id' })
  enrollmentId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @CreateDateColumn({
    name: 'assigned_at',
    type: 'timestamp with time zone',
  })
  assignedAt: Date;

  @Column({
    name: 'progress_percent',
    type: 'int',
    default: 0,
  })
  progressPercent: number;

  @Column({
    name: 'is_completed',
    type: 'boolean',
    default: false,
  })
  isCompleted: boolean;

  @Column({
    name: 'completed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt: Date | null;

  @UpdateDateColumn({
    name: 'last_accessed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastAccessedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
