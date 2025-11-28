import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsNumber } from 'class-validator';

/**
 * Query params genericos para las consultas paginadas.
 */
export class QueryParamsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string = '';

  @IsOptional()
  @IsString()
  orderBy?: string = 'title';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}

