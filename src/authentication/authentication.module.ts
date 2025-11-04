import { Global, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'src/config/configuration';
import { MailModule } from 'src/mail/mail.module';
import { AuthGuard } from './guard/authentication.guard';


@Module({
  imports:[
    UsersModule,
    JwtModule.registerAsync({
      useFactory: () => ({  
        global: true,
        secret: configuration().JWTSecret
      })
    }),
    MailModule
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, 
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    }
   ],
})
export class AuthenticationModule {}
