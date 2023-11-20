/* eslint-disable prettier/prettier */
import { IsDate, IsNotEmpty, IsString, IsUrl } from "class-validator";
export class ClubDto {
   @IsString()
   @IsNotEmpty()
   readonly nombre: string;

   @IsDate()
   readonly fecha_fundacion: number;

   @IsUrl()
   readonly imagen: string;

   @IsString()
   readonly descripcion: string;

}

