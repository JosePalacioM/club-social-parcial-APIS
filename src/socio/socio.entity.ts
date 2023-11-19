/* eslint-disable prettier/prettier */
import { Column,Entity,ManyToMany,PrimaryGeneratedColumn, } from 'typeorm';
import { ClubEntity } from '../club/club.entity';

@Entity()
export class SocioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @Column()
  fecha_nacimiento: Date;
  
  @ManyToMany(() => ClubEntity, club => club.socios)
  clubs: ClubEntity[];

}
