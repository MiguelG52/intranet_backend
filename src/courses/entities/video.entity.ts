import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { UserVideoProgress } from './user-video-progress.entity';

@Entity('video')
export class Video {
  @PrimaryColumn({
    type: 'uuid',
    name: 'video_id',
    default: () => 'gen_random_uuid()',
  })
  videoId: string;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  courseId: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  resolution: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  format: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => UserVideoProgress, (progress) => progress.video)
  userProgress: UserVideoProgress[];
}
