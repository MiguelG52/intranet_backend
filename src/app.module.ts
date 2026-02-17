import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { CoursesModule } from './courses/courses.module';
import { BenefitsModule } from './benefits/benefits.module';
import { NewsModule } from './news/news.module';
import { CountryModule } from './organization/country/country.module';
import { RoleModule } from './role/role.module';
import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';
import { PositionsModule } from './organization/positions/positions.module';
import { AreasModule } from './organization/areas/areas.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RssModule } from './rss/rss.module';
import { CacheModule } from '@nestjs/cache-manager';
import { TeamModule } from './organization/team/team.module';
import { CoordinationModule } from './organization/coordination/coordination.module';
import { MethodologyModule } from './organization/methodology/methodology.module';
import { FormsModule } from './forms/forms.module';
import { ProjectsModule } from './projects/projects.module';
import { VacationsModule } from './vacations/vacations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres',
          url: dbConfig.url,
          entities: dbConfig.entities,
          synchronize: dbConfig.synchronize,
          autoLoadEntities: true,
          logging: false,
        };
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.office365.com', 
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"INTRANET ASHA"<${configService.get<string>('MAIL_USER')}>`,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    CacheModule.register(),
    AuthenticationModule, 
    UsersModule, 
    DocumentsModule, 
    CoursesModule, 
    BenefitsModule, 
    NewsModule, 
    CountryModule, 
    RoleModule, 
    MailModule, 
    PositionsModule, 
    AreasModule, 
    RssModule, 
    TeamModule,
    CoordinationModule,
    MethodologyModule,
    FormsModule,
    ProjectsModule,
    VacationsModule,
  ],
  controllers: [],
  exports:[TypeOrmModule],
})
export class AppModule {}
