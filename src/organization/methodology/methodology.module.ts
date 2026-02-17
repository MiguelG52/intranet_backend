import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Methodology } from './entities/methodology.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Methodology])],
})
export class MethodologyModule {}
