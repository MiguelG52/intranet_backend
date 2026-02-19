import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordination } from './entities/coordination.entity';
import { AreaCoordination } from './entities/area-coordination.entity';
import { CoordinationController } from './coordination.controller';
import { CoordinationService } from './coordination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coordination, AreaCoordination])],
  controllers: [CoordinationController],
  providers: [CoordinationService],
  exports: [CoordinationService],
})
export class CoordinationModule {}
