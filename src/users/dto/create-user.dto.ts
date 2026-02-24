import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDetailDto } from './create-user-detail.dto';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  lastname: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsUUID('4', { message: 'El ID del rol debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  roleId: string;

  @IsString({ message: 'El código de país debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El país es obligatorio' })
  countryCode: string;

  @ValidateIf(o => o.positionId !== undefined && o.positionId !== null && o.positionId.trim() !== '')
  @IsUUID('4', { message: 'El ID del puesto debe ser un UUID válido' })
  positionId?: string;

  @ValidateIf(o => o.areaId !== undefined && o.areaId !== null && o.areaId.trim() !== '')
  @IsUUID('4', { message: 'El ID del área debe ser un UUID válido' })
  areaId?: string;

  @ValidateIf(o => o.methodologyId !== undefined && o.methodologyId !== null && o.methodologyId.trim() !== '')
  @IsUUID('4', { message: 'El ID de la metodología debe ser un UUID válido' })
  methodologyId?: string;

  @ValidateIf(o => o.teamId !== undefined && o.teamId !== null && o.teamId.trim() !== '')
  @IsUUID('4', { message: 'El ID del equipo debe ser un UUID válido' })
  teamId?: string;

  @IsDateString(undefined, { message: 'La fecha de ingreso debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  startDate?: Date;

  @ValidateNested()
  @Type(() => CreateUserDetailDto)
  @IsOptional()
  detail?: CreateUserDetailDto;
}