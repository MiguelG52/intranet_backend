import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCoordinationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
