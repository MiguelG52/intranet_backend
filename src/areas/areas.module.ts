import { Module, forwardRef } from '@nestjs/common';
import { AreaService } from './areas.service';
import { AreasController } from './areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { CountryModule } from 'src/country/country.module';
import { PositionsModule } from 'src/positions/positions.module';

@Module({
  imports:[
    CountryModule,
    forwardRef(() => PositionsModule),
    TypeOrmModule.forFeature([Area])
  ],
  controllers: [AreasController],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreasModule {}
