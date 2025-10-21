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
    AuthenticationModule, 
    UsersModule, 
    DocumentsModule, 
    CoursesModule, 
    BenefitsModule, 
    NewsModule, 
    CountryModule, 
    RoleModule
  ],
  controllers: [],
  exports:[TypeOrmModule],
})
export class AppModule {}
