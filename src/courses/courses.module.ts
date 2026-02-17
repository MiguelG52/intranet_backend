import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Certificate } from './entities/certificate.entity';
import { Video } from './entities/video.entity';
import { CoursePath } from './entities/course-path.entity';
import { CoursePathDetail } from './entities/course-path-detail.entity';
import { UserCourseEnrollment } from './entities/user-course-enrollment.entity';
import { UserPathEnrollment } from './entities/user-path-enrollment.entity';
import { UserVideoProgress } from './entities/user-video-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      Certificate,
      Video,
      CoursePath,
      CoursePathDetail,
      UserCourseEnrollment,
      UserPathEnrollment,
      UserVideoProgress,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
