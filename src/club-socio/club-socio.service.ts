/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException,} from '../shared/errors/business-errors';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';

@Injectable()
export class ClubSocioService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubRepository: Repository<ClubEntity>,

    @InjectRepository(SocioEntity)
    private readonly socioRepository: Repository<SocioEntity>,
  ) {}

  // Añadir Socio a un País
  async addSocioClub(
    clubId: string,
    socioId: string,
  ): Promise<ClubEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        `La socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        `El club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    club.socios = [
      ...club.socios,
      socio,
    ];
    return await this.clubRepository.save(club);
  }

  // Encontrar Socios por ID del País
  async findSociosByClubId(
    clubId: string,
  ): Promise<SocioEntity[]> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        `El club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    return club.socios;
  }

  // Encontrar Socio por ID del País y su ID de Socio
  async findSocioByclubIdsocioId(
    clubId: string,
    socioId: string,
  ): Promise<SocioEntity> {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        `La socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        `El club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const clubSocio: SocioEntity = club.socios.find(
      (e) => e.id === socio.id,
    );

    if (!clubSocio)
      throw new BusinessLogicException(
        `El club con id ${clubId} y la socio con id ${socioId} no están asociados`,
        BusinessError.PRECONDITION_FAILED,
      );

    return clubSocio;
  }

  // Asociar Socios a un País
  async associateSociosClub(
    clubId: string,
    socios: SocioEntity[],
  ): Promise<ClubEntity> {
    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });

    if (!club)
      throw new BusinessLogicException(
        `El club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    for (let i = 0; i < socios.length; i++) {
      const socio: SocioEntity = await this.socioRepository.findOne({
        where: { id: socios[i].id },
      });
      if (!socio)
        throw new BusinessLogicException(
          `La socio con id ${socios[i].id} no existe`,
          BusinessError.NOT_FOUND,
        );
    }

    club.socios = socios;

    return await this.clubRepository.save(club);
  }

  // Eliminar Socio de un País
  async deleteSocioClub(
    clubId: string,
    socioId: string,
  ) {
    const socio: SocioEntity = await this.socioRepository.findOne({
      where: { id: socioId },
    });
    if (!socio)
      throw new BusinessLogicException(
        `La socio con id ${socioId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const club: ClubEntity = await this.clubRepository.findOne({
      where: { id: clubId },
      relations: ['socios'],
    });
    if (!club)
      throw new BusinessLogicException(
        `El club con id ${clubId} no existe`,
        BusinessError.NOT_FOUND,
      );

    const clubSocio: SocioEntity = club.socios.find(
      (e) => e.id === socio.id,
    );

    if (!clubSocio)
      throw new BusinessLogicException(
        `El club con id ${clubId} y la socio con id ${socioId} no están asociados`,
        BusinessError.PRECONDITION_FAILED,
      );

    club.socios = club.socios.filter(
      (e) => e.id !== socioId,
    );
    await this.clubRepository.save(club);
  }
}
