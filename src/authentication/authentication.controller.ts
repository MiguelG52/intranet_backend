import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Request, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Public } from 'src/authentication/decorators/authGuard.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { RoleGuard } from './guard/role.guard';
import { Roles } from './decorators/role.decoratos';
import { Role } from './enum/role.enum';


@Controller('auth')
@UseGuards(RoleGuard)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("register")
  @Roles(Role.Admin)
  @HttpCode(201)
  create(@Body() createUserData: CreateUserDto) {
    return this.authenticationService.registerAccount(createUserData);
  }

  @Public()
  @HttpCode(200)
  @Post("login")
  signIn(@Body() signInData: SignInDto) {
    return this.authenticationService.signIn(signInData);
  }

  @Get('me')
  @HttpCode(200)
  getProfile(@Request() req) {
    const userId = req.user.sub;
    return this.authenticationService.getUserProfile(userId);
  }

  @Public()
  @Post('refresh')
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
