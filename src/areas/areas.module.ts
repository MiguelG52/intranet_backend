import { Module } from '@nestjs/common';
import { AreaService } from './areas.service';
import { AreasController } from './areas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { CountryModule } from 'src/country/country.module';

@Module({
  imports:[
    CountryModule,
    TypeOrmModule.forFeature([Area])
  ],
  controllers: [AreasController],
  providers: [AreaService],
  exports: [AreaService],
})
export class AreasModule {}
