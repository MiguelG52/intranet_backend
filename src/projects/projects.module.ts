import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UserProject } from './entities/user-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, UserProject])],
})
export class ProjectsModule {}
