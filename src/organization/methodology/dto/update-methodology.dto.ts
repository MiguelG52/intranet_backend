import { PartialType } from '@nestjs/mapped-types';
import { CreateMethodologyDto } from './create-methodology.dto';

export class UpdateMethodologyDto extends PartialType(CreateMethodologyDto) {}
