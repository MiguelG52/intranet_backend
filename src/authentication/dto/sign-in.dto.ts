import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInDto {
    @IsEmail()
    email:string;
    @IsNotEmpty({ message: 'La contraseña no debe estar vacía' })
    password:string;
}
