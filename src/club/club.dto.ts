/* eslint-disable prettier/prettier */
import { IsDate, IsNotEmpty, IsString, IsUrl, MaxLength } from "class-validator";
export class ClubDto {
   @IsString()
   @IsNotEmpty()
   readonly nombre: string;

   @IsDate()
   readonly fecha_fundacion: number;

   @IsUrl()
   readonly imagen: string;

   @IsString()
   @MaxLength(100, { message: 'El campo nombre no puede tener más de 100 caracteres' })
   readonly descripcion: string;

}

