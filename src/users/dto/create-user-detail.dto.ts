import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsOptional, IsString, IsUUID, MaxLength, ValidateIf, ValidateNested } from 'class-validator';

export class CreateUserDetailDto {
  @IsString({ message: 'El ID de MS Teams debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El ID de MS Teams no puede exceder 100 caracteres' })
  msTeamsId?: string;

  @IsString({ message: 'La foto de perfil debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La URL de la foto de perfil no puede exceder 255 caracteres' })
  profilePicture?: string;

  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(20, { message: 'El número de teléfono no puede exceder 20 caracteres' })
  phoneNumber?: string;

  @IsDateString(undefined, { message: 'La fecha de nacimiento debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  birthdate?: Date;

  @IsDateString(undefined, { message: 'La fecha de ingreso debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  startDate?: Date;
}

export class UpdateUserAdminDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastname?: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsOptional()
  email?: string;

  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  @IsOptional()
  roleId?: string;

  @IsString({ message: 'El código de país debe ser una cadena de texto' })
  @IsOptional()
  countryCode?: string;

  @ValidateIf(o => o.positionId !== undefined && o.positionId !== null && o.positionId.trim() !== '')
  @IsUUID('4', { message: 'El ID del puesto debe ser un UUID válido' })
  positionId?: string;

  @ValidateIf(o => o.methodologyId !== undefined && o.methodologyId !== null && o.methodologyId.trim() !== '')
  @IsUUID('4', { message: 'El ID de la metodología debe ser un UUID válido' })
  methodologyId?: string;

  @ValidateIf(o => o.teamId !== undefined && o.teamId !== null && o.teamId.trim() !== '')
  @IsUUID('4', { message: 'El ID del equipo debe ser un UUID válido' })
  teamId?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateUserDetailDto)
  detail?: CreateUserDetailDto;
}