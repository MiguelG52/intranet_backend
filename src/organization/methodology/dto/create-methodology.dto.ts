import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateMethodologyDto {
  @IsNotEmpty({ message: 'El ID de coordinación es requerido' })
  @IsUUID('4', { message: 'El ID de coordinación debe ser un UUID válido' })
  coordinationId: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  name: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;
}
