import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastname?: string;
}