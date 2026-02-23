import {
  IsDateString,
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
  @IsOptional()
  positionId?:string;

  @IsUUID()
  @IsOptional()
  areaId?: string;

  @IsUUID()
  @IsOptional()
  methodologyId?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @IsDateString(undefined, { message: 'La fecha de ingreso debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  startDate?: Date;

  @ValidateNested() 
  @Type(() => CreateUserDetailDto) 
  @IsOptional()
  detail?: CreateUserDetailDto;
}