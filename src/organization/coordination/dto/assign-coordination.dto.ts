import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignCoordinationToAreaDto {
  @IsUUID()
  @IsNotEmpty()
  coordinationId: string;

  @IsUUID()
  @IsNotEmpty()
  areaId: string;
}
