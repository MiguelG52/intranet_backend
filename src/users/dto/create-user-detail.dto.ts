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


  @IsDateString(undefined, { message: 'La fecha de nacimineto debe estar en formato ISO 8601: AAAA-MM-DD' })
  @IsOptional()
  birthdate?: Date;
}