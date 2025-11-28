import { IsDateString, IsEmail, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAccountDto{
    @IsEmail()
    email:string;
    password:string;
    @IsString()
    name:string;
    @IsString()
    lastname:string;
    @IsUUID()
    role:string;
    @IsOptional()
    @IsNumber()
    phone?:string;
    @IsString()
    countryCode:string;
    @IsDateString()
    birthdate:Date;
    
    msTeamsId?:string;
}