import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { User } from '../../users/entities/user.entity';

@Entity('certificate')
export class Certificate {
  @PrimaryColumn({
    type: 'uuid',
    name: 'certificate_id',
    default: () => 'gen_random_uuid()',
  })
  certificateId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({
    name: 'issued_date',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  issuedDate: Date;

  @Column({ name: 'file_url', type: 'varchar', length: 255, nullable: true })
  fileUrl: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
