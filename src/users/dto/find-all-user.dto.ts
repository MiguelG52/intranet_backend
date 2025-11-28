import { IsOptional, IsString } from "class-validator";
import { QueryParamsDto } from "src/common/dto/query-params.dto";

/**
 * Parametros especificos para las consultas paginadas de usuarios.
 */
export class UsersQueryParamsDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  positionId?: string;

  orderBy?: string = 'name';
}