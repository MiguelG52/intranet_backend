import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserAuthDto {
  @IsString()
  @IsOptional()
  refreshToken?: string | null;

  @IsString()
  @IsOptional()
  passwordHash?: string;

  @IsString()
  @IsOptional()
  token2fa?: string | null;

  @IsDate()
  @IsOptional()
  token2faExpiresAt?: Date | null;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}