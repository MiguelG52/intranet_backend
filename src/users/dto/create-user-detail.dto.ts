import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';

export class CreateUserDetailDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  msTeamsId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  profilePicture?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;


  @IsDateString(undefined, { message: 'La fecha de nacimineto debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  birthdate?: Date;

  @IsDateString(undefined, { message: 'La fecha de ingreso debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  startDate?: Date;
}

export class UpdateUserAdminDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastname?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsUUID()
  @IsOptional()
  positionId?: string;

  @IsUUID()
  @IsOptional()
  methodologyId?: string;

  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateUserDetailDto)
  detail?: CreateUserDetailDto;
}