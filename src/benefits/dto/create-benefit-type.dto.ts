import { IsOptional, IsString } from "class-validator";

export class CreateBenefitTypeDto {
    @IsString()
    title: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsString()
    @IsOptional()
    icon?: string;
}