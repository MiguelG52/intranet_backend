import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coordination } from './entities/coordination.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coordination])],
})
export class CoordinationModule {}
