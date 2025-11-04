import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CountryModule } from 'src/country/country.module';
import { RoleModule } from 'src/role/role.module';
import { UserAccountDetail } from './entities/userAccountDetail.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAccountDetail]),
    CountryModule,
    RoleModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
