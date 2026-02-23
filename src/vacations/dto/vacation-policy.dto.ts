import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateVacationPolicyDto {
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsInt()
  @Min(0)
  yearsOfService: number;

  @IsInt()
  @Min(1)
  daysGranted: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateVacationPolicyDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  daysGranted?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
