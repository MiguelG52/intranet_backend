import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Methodology } from './entities/methodology.entity';
import { AreaCoordination } from 'src/organization/coordination/entities/area-coordination.entity';
import { MethodologyController } from './methodology.controller';
import { MethodologyService } from './methodology.service';

@Module({
  imports: [TypeOrmModule.forFeature([Methodology, AreaCoordination])],
  controllers: [MethodologyController],
  providers: [MethodologyService],
  exports: [MethodologyService],
})
export class MethodologyModule {}
