import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { CoursePathDetail } from './course-path-detail.entity';
import { UserPathEnrollment } from './user-path-enrollment.entity';

@Entity('course_path')
export class CoursePath {
  @PrimaryColumn({
    type: 'uuid',
    name: 'path_id',
    default: () => 'gen_random_uuid()',
  })
  pathId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => CoursePathDetail, (detail) => detail.coursePath)
  courseDetails: CoursePathDetail[];

  @OneToMany(() => UserPathEnrollment, (enrollment) => enrollment.coursePath)
  enrollments: UserPathEnrollment[];
}
