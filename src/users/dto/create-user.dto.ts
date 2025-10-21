import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDetailDto } from './create-user-detail.dto';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres, un simbolo y un número' })
  password: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ValidateNested() 
  @Type(() => CreateUserDetailDto) 
  @IsOptional()
  detail?: CreateUserDetailDto;
}