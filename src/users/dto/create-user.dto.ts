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

  @IsStrongPassword(undefined,{ message: 'La contraseña debe tener al menos 8 caracteres, un simbolo y un número' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres, un simbolo y un número' })
  password: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty({message:"El país es obligatorio"})
  countryCode: string;

  @IsUUID()
  @IsNotEmpty({message:"El puesto es obligatorio"})
  positionId:string;


  @ValidateNested() 
  @Type(() => CreateUserDetailDto) 
  @IsOptional()
  detail?: CreateUserDetailDto;
}