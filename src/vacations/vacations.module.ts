import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacation } from './entities/vacation.entity';
import { VacationRequest } from './entities/vacation-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vacation, VacationRequest])],
})
export class VacationsModule {}
