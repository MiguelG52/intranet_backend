import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Certificate } from './certificate.entity';
import { Video } from './video.entity';
import { CoursePathDetail } from './course-path-detail.entity';
import { UserCourseEnrollment } from './user-course-enrollment.entity';

@Entity('course')
export class Course {
  @PrimaryColumn({
    type: 'uuid',
    name: 'course_id',
    default: () => 'gen_random_uuid()',
  })
  courseId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Certificate, (certificate) => certificate.course)
  certificates: Certificate[];

  @OneToMany(() => Video, (video) => video.course)
  videos: Video[];

  @OneToMany(() => CoursePathDetail, (detail) => detail.course)
  coursePathDetails: CoursePathDetail[];

  @OneToMany(() => UserCourseEnrollment, (enrollment) => enrollment.course)
  enrollments: UserCourseEnrollment[];
}
