import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCountryDto {
    @IsString()
    name:string;
    
    @IsString()
    code:string;

    @IsString()
      @IsOptional()
      @MaxLength(5)
      phoneCountryCode?: string;
}
