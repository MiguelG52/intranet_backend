import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CoursePath } from './course-path.entity';
import { Course } from './course.entity';

@Entity('course_path_detail')
@Index(['pathId', 'courseId'], { unique: true })
export class CoursePathDetail {
  @PrimaryGeneratedColumn('uuid', { name: 'path_course_id' })
  pathCourseId: string;

  @Column({ name: 'path_id', type: 'uuid' })
  pathId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ 
    name: 'order_index', 
    type: 'int',
    comment: 'Orden del curso dentro de la ruta (1, 2, 3, ...)'
  })
  orderIndex: number;

  @Column({
    name: 'is_mandatory',
    type: 'boolean',
    default: true,
    comment: 'Si el curso es obligatorio para completar la ruta'
  })
  isMandatory: boolean;

  @ManyToOne(() => CoursePath, (path) => path.courseDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'path_id' })
  coursePath: CoursePath;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
