import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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