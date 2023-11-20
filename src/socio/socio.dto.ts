/* eslint-disable prettier/prettier */
import { IsDate, IsEmail, IsNotEmpty, IsString, } from "class-validator";
export class SocioDto {
   @IsString()
   @IsNotEmpty()
   readonly nombre: string;

   @IsEmail()
   readonly correo: string;

   @IsDate()
   readonly fecha_nacimiento: Date;

}
