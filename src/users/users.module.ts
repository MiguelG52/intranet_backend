import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CountryModule } from 'src/organization/country/country.module';
import { UserAccountDetail } from './entities/userAccountDetail.entity';
import { MailModule } from 'src/mail/mail.module';
import { UserPosition } from './entities/user-position.entity';
import { PositionsModule } from 'src/organization/positions/positions.module';
import { UserFunctionalAssignment } from './entities/user-functional-assigment.entity';
import { Area } from 'src/organization/areas/entities/area.entity';
import { Methodology } from 'src/organization/methodology/entities/methodology.entity';
import { Team } from 'src/organization/team/entities/team.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      UserAccountDetail, 
      UserPosition, 
      UserFunctionalAssignment,
      Area,
      Methodology,
      Team
    ]),
    CountryModule,
    PositionsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
