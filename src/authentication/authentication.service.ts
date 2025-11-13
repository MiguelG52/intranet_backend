import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { generateResetToken } from 'src/libs/generateToken';
import { UpdateAccountDto } from './dto/update-account.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignInReponse } from './responses/sign-in.reponse';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UserSignInInfo } from './responses/sign-in.reponse';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { UserProfileResponse } from './responses/user-profile.response';

@Injectable()
export class AuthenticationService {
  

  constructor(
    private readonly UserService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailService
  
  ){    
  }

  async signIn(signInData: SignInDto): Promise<SignInReponse> {
      const user = await this.UserService.findOneByEmail(signInData.email);

      if (!user || !user.passwordHash) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }
      if (!user.role) {
        throw new InternalServerErrorException('Configuración de cuenta inválida.');
      }

      const passwordMatches = await compare(signInData.password, user.passwordHash);
      if (!passwordMatches) {
        throw new UnauthorizedException('Credenciales incorrectas.');
      }

      if(!user.isVerified){
        throw new UnauthorizedException('La cuenta no está verificada. Por favor, verifica tu correo electrónico.');
      }

      if(!user.isActive){
        throw new UnauthorizedException('La cuenta no está activa. Por favor, verifica tu correo electrónico.');
      }

      const payload = { 
        sub: user.userId, 
        email: user.email,
        role: user.role.roleName, 
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, { expiresIn: '15m' }),
        this.jwtService.signAsync(payload, {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d' 
        }),
      ])
      

      const hashedRefreshToken = await hash(refreshToken, 10);
      await this.UserService.updateAuthFields(user.userId, {
        refreshToken: hashedRefreshToken, 
      });

      
      const userResponse: UserSignInInfo = {
        userId: user.userId,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: {
          roleId: user.role.roleId,
          roleName: user.role.roleName,
        },
      };

      return {
        accessToken: accessToken,
        user: userResponse,
        refreshToken: refreshToken,
      };
  }
  async registerAccount(createUserData: CreateUserDto) { 
    const newUser = await this.UserService.create(createUserData);
    try {
      await this.mailerService.sendAccountVerificationEmail(
        newUser,
        newUser.token2fa
      );
    } catch (emailError) {

      console.error(
        `La cuenta de ${newUser.email} se creó, pero falló el envío del correo de verificación.`,
        emailError
      );
    }
    return {
      message: 'Cuenta creada. Se ha enviado un correo de verificación.'
    };
}

  async requestPasswordReset(email:string){
    const successMessage = 'Si el correo existe en nuestro sistema, recibirás un email con las instrucciones para restablecer tu contraseña.';
    const user = await this.UserService.findOneByEmail(email);
    if(!user){
      return {message: successMessage}
    }
    const token = generateResetToken();
    const expires = new Date(Date.now() + 30 * 60 * 1000); 

    try {

      await this.UserService.updateAuthFields(user.userId, {
        token2fa: token,
        token2faExpiresAt: expires,
      });
      // await this.mailerService.sendPasswordResetEmail(user.email, user.name, token);    
      return { message: successMessage };

    } catch (error) {
      throw new InternalServerErrorException('Error al procesar la solicitud.');
    }

    
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('No se proporcionó el token de refresco');
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    const user = await this.UserService.findOneById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const isMatch = await compare(token, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const newPayload = { 
      sub: user.userId, 
      email: user.email, 
      role: user.role.roleName 
    };
    
    const accessToken = await this.jwtService.signAsync(newPayload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '15m',
    });

    return { accessToken };
  }

  async getUserProfile(userId: string):Promise<UserProfileResponse | null> {
    const user = await this.UserService.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
  update(id: number, updateAuthenticationDto: UpdateAccountDto) {
    return `This action updates a #${id} authentication`;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }
}
