/* eslint-disable prettier/prettier */
import { Injectable,BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException,} from '../shared/errors/business-errors';
import { ClubEntity } from './club.entity';

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  async create(club: ClubEntity): Promise<ClubEntity> {
    if (club.nombre.length > 100) {
      throw new BadRequestException('El campo nombre no puede tener más de 100 caracteres');
    }

    return await this.clubRepository.save(club);
  }

  async findAll(): Promise<ClubEntity[]> {
    return await this.clubRepository.find({relations: ['socios'],});
  }

  async findOne(id: string): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({where: { id },relations: ['socios'], });
    if (!club)
      throw new BusinessLogicException(`El club con id ${id} no existe`,BusinessError.NOT_FOUND,);
    return club;
  }

  async update(id: string,club: ClubEntity,): Promise<ClubEntity> {
    const persistedClub: ClubEntity = await this.clubRepository.findOne({where: { id }, });
    if (!persistedClub)
      throw new BusinessLogicException(`El club con id ${id} no existe`,BusinessError.NOT_FOUND,);
    club.id = id;
    return await this.clubRepository.save(club);
  }

  async delete(id: string) {
    const club: ClubEntity = await this.clubRepository.findOne({where: { id },});
    if (!club)
      throw new BusinessLogicException(`El club con id ${id} no existe`,BusinessError.NOT_FOUND,);
    await this.clubRepository.remove(club);
  }
}
