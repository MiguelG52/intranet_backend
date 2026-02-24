import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateAreaDto {
  @IsString({message:'El nombre del area debe ser una cadena de texto'})
  @IsNotEmpty({message:'El nombre del area es obligatorio'})
  areaName: string;

  @IsString({message:'El código de pais debe ser una cadena de texto'})
  @IsOptional()
  countryCode?: string;

  @ValidateIf(o => o.coordinationId !== undefined && o.coordinationId !== null && o.coordinationId.trim() !== '')
  @IsUUID('4', {message:'El ID de coordinación debe ser un UUID válido'})
  coordinationId?: string;
}