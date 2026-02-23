import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacationsService } from './vacations.service';
import { VacationsController } from './vacations.controller';
import { Vacation } from './entities/vacation.entity';
import { VacationRequest } from './entities/vacation-request.entity';
import { VacationPolicy } from './entities/vacation-policy.entity';
import { VacationBalance } from './entities/vacation-balance.entity';
import { User } from 'src/users/entities/user.entity';
import { CountryModule } from 'src/organization/country/country.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CountryModule,
      Vacation,
      VacationRequest,
      VacationPolicy,
      VacationBalance,
      User,
    ]),
  ],
  controllers: [VacationsController],
  providers: [VacationsService],
  exports: [VacationsService],
})
export class VacationsModule {}
