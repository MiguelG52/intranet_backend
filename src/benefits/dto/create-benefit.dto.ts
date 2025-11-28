import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateBenefitDto {

    @IsString({message:"El código de país es obligatorio"})
    countryCode: string;
    
    @IsString({message:"El título es obligatorio"})
    title: string;

    @IsOptional()
    @IsString({message:"La descripción debe ser un texto"})
    description?: string;
    
    @IsUUID(4,{message:"El tipo de beneficio es obligatorio"})
    benefitTypeId: string;
}
