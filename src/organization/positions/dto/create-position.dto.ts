import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePositionDto {
  @IsString({message:'El título del puesto debe ser una cadena de texto'})
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsNotEmpty()
  areaId: string;

  @IsString({message:'La descripción del puesto debe ser una cadena de texto'})
  @IsOptional()
  description?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  @IsOptional() 
  managerId?: string;
}