/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException,} from '../shared/errors/business-errors';
import { SocioEntity } from '../socio/socio.entity';
import { ClubEntity } from '../club/club.entity';

@Injectable()
export class SocioClubService {
  constructor(
    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,

    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,
  ) {}

  // Añadir Club a un Socio
  async addClubSocio(
    socioId: string,
    clubId: string,
  ): Promise<SocioEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
    });
    if (!club)
      throw new BusinessLogicException(
        `La club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
      relations: ['clubs'],
    });
    if (!socio)
      throw new BusinessLogicException(
        `El socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    socio.clubs = [
      ...socio.clubs,
      club,
    ];
    return await this.socioRepository.save(socio);
  }

  // Encontrar Clubs por ID del País
  async findClubsBySocioId(
    socioId: string,
  ): Promise<ClubEntity[]> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
      relations: ['clubs'],
    });
    if (!socio)
      throw new BusinessLogicException(
        `El socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    return socio.clubs;
  }

  // Encontrar Club por ID del País y su ID de Club
  async findClubBysocioIdclubId(
    socioId: string,
    clubId: string,
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
    });
    if (!club)
      throw new BusinessLogicException(
        `La club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
      relations: ['clubs'],
    });
    if (!socio)
      throw new BusinessLogicException(
        `El socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const socioClub: ClubEntity = socio.clubs.find(
      (e) => e.id === club.id,
    );

    if (!socioClub)
      throw new BusinessLogicException(
        `El socio con id ${socioId} y la club con id ${clubId} no están asociados`,
        BusinessError.PRECONDITION_FAILED,
      );

    return socioClub;
  }

  // Asociar Clubs a un País
  async associateClubsSocio(
    socioId: string,
    clubs: ClubEntity[],
  ): Promise<SocioEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
      relations: ['clubs'],
    });

    if (!socio)
      throw new BusinessLogicException(
        `El socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < clubs.length; i++) {
      const club: ClubEntity = await this.clubRepository.findOne({
        where: { id: clubs[i].id },
      });
      if (!club)
        throw new BusinessLogicException(
          `La club con id ${clubs[i].id} no existe`,
          BusinessError.NOT_FOUND,
        );
    }

    socio.clubs = clubs;

    return await this.socioRepository.save(socio);
  }

  // Eliminar Club de un País
  async deleteClubSocio(
    socioId: string,
    clubId: string,
  ) {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
    });
    if (!club)
      throw new BusinessLogicException(
        `La club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
      relations: ['clubs'],
    });
    if (!socio)
      throw new BusinessLogicException(
        `El socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const socioClub: ClubEntity = socio.clubs.find(
      (e) => e.id === club.id,
    );

    if (!socioClub)
      throw new BusinessLogicException(
        `El socio con id ${socioId} y la club con id ${clubId} no están asociados`,
        BusinessError.PRECONDITION_FAILED,
      );

    socio.clubs = socio.clubs.filter(
      (e) => e.id !== clubId,
    );
    await this.socioRepository.save(socio);
  }
}
