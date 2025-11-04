import { IsString, IsDate, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserAuthDto {
  @IsString()
  @IsOptional()
  refreshToken?: string | null;

  @IsString()
  @IsOptional()
  token2fa?: string;

  @IsDate()
  @IsOptional()
  token2faExpiresAt?: Date;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}