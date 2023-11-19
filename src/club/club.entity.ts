/* eslint-disable prettier/prettier */
import { Column,Entity,ManyToMany,PrimaryGeneratedColumn,JoinTable } from 'typeorm';
import { SocioEntity } from '../socio/socio.entity';

@Entity()
export class ClubEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({nullable: true })
  fecha_fundacion: Date;

  @Column({nullable: true })
  imagen: string;

  @Column({ length: 100, nullable: true })
  descripcion: string;

  @ManyToMany(() => SocioEntity, (socio) => socio.clubs)
  @JoinTable() 
  socios: SocioEntity[];
}