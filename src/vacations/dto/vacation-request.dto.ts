import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateVacationRequestDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReviewVacationRequestDto {
  @IsString()
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class QueryVacationRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
