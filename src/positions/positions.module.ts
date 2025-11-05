import { Module } from '@nestjs/common';
import { PositionService } from './positions.service';
import { PositionController } from './positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { AreasModule } from 'src/areas/areas.module';
import { CountryModule } from 'src/country/country.module';

@Module({
  imports: [
    CountryModule,
    AreasModule,
    TypeOrmModule.forFeature([Position])
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionsModule {}
