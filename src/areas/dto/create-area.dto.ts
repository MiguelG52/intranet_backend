import { IsNotEmpty, IsOptional, IsString, Length,} from 'class-validator';

export class CreateAreaDto {
  @IsString({message:'El nombre del area debe ser una cadena de texto'})
  @IsNotEmpty({message:'El nombre del area es obligatorio'})
  areaName: string;

  @IsString({message:'El código de pais debe ser una cadena de texto'})
  @IsOptional()
  @Length(2, 10) 
  countryCode?: string; 

}