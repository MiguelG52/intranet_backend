import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { CoursesModule } from './courses/courses.module';
import { BenefitsModule } from './benefits/benefits.module';
import { NewsModule } from './news/news.module';
import { CountryModule } from './country/country.module';
import { RoleModule } from './role/role.module';
import configuration from './config/configuration';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './mail/mail.module';

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
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: dbConfig.entities,
          synchronize: dbConfig.sincronize,
          autoLoadEntities: true,
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
    AuthenticationModule, 
    UsersModule, 
    DocumentsModule, 
    CoursesModule, 
    BenefitsModule, 
    NewsModule, 
    CountryModule, 
    RoleModule, MailModule, 
  ],
  controllers: [],
  exports:[TypeOrmModule],
})
export class AppModule {}
