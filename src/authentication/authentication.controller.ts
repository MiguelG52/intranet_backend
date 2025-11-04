import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Public } from 'src/authentication/decorators/authGuard.decorator';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("register")
  @HttpCode(201)
  create(@Body() createUserData: CreateUserDto) {
    return this.authenticationService.registerAccount(createUserData);
  }

  @Public()
  @HttpCode(200)
  @Post("login")
  signIn(@Body() signInData: any) {
    return this.authenticationService.signIn(signInData);
  }


  @Public()
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authenticationService.refreshToken(refreshToken);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthenticationDto: UpdateAccountDto) {
    return this.authenticationService.update(+id, updateAuthenticationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(+id);
  }
}
