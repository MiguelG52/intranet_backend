import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @MaxLength(10)
  phoneCountryCode?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: Date;
}