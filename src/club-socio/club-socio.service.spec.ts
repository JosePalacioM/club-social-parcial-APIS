/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClubSocioService } from './club-socio.service';
import { ClubEntity } from '../club/club.entity';
import { SocioEntity } from '../socio/socio.entity';
import { faker } from '@faker-js/faker';
import { BusinessError } from '../shared/errors/business-errors';

describe('ClubSocioService', () => {
  let service: ClubSocioService;
  let socioRepository: Repository<SocioEntity>;
  let clubRepository: Repository<ClubEntity>;
  let club: ClubEntity;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubSocioService],
    }).compile();

    service = module.get<ClubSocioService>(
      ClubSocioService,
    );
    clubRepository = module.get<Repository<ClubEntity>>(
      getRepositoryToken(ClubEntity),
    );
    socioRepository = 
      module.get<Repository<SocioEntity>>(
        getRepositoryToken(SocioEntity),
      );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    socioRepository.clear();
    clubRepository.clear();

    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity =
        await socioRepository.save(getNewSocio());
      sociosList.push(socio);
    }

    club = await clubRepository.save(
      getNewClub(sociosList),
    );
  };

  const getNewSocio = (): any => {
    return {
      nombre: faker.company.name(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      clubs: [],
    };
  };

  const getNewClub = (
    sociosList: SocioEntity[] = [],
  ): any => {
    return {
      nombre: faker.company.name(),
      historia: faker.lorem.sentence(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      socios: sociosList,
    };
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addMemberToClub should add a socio to a club', async () => {
    const newSocio: SocioEntity =
      await socioRepository.save(getNewSocio());

    const newClub: ClubEntity = await clubRepository.save(getNewClub(),);

    const result: ClubEntity = await service.addMemberToClub(newClub.id, newSocio.id,);

    expect(result.socios.length).toBe(1);
    expect(result.socios[0]).not.toBeNull();
    expect(result.socios[0].nombre).toBe(newSocio.nombre,);
    expect(result.socios[0].correo).toBe(newSocio.correo,);
    expect(result.socios[0].fecha_nacimiento).toEqual(newSocio.fecha_nacimiento,);
  });

  it('addMemberToClub should thrown exception for an invalid socio', async () => {
    const newClub: ClubEntity = await clubRepository.save(
      getNewClub(),
    );

    await expect(() =>
      service.addMemberToClub(newClub.id, "0"),
    ).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('addMemberToClub should throw an exception for an invalid club', async () => {
    const newSocio: ClubEntity = await socioRepository.save(getNewSocio());

    await expect(() =>
      service.addMemberToClub("0", newSocio.id),
    ).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('findMemberFromClub should return socio by club', async () => {
    const socio: SocioEntity = sociosList[0];
    const storedSocio: SocioEntity = await service.findMemberFromClub(club.id,socio.id,);
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toBe(socio.nombre);
    expect(storedSocio.correo).toBe(socio.correo,);
    expect(storedSocio.fecha_nacimiento).toEqual(socio.fecha_nacimiento,);
  });

  it('findMemberFromClub should throw an exception for an invalid socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await expect(() =>
      service.findMemberFromClub("0",socio.id,),
    ).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('findMemberFromClub should throw an exception for an invalid club', async () => {
    await expect(() =>
      service.findMemberFromClub(club.id,"0",),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('findMemberFromClub should throw an exception for an socio not associated to the club', async () => {
    const newSocio: SocioEntity =
      await socioRepository.save(getNewSocio());

    await expect(() =>
      service.findMemberFromClub(club.id,newSocio.id,),).rejects.toHaveProperty('type', BusinessError.PRECONDITION_FAILED);
  });

  it('findMembersFromClub should return socio by clubs', async () => {
    const socios: SocioEntity[] =  await service.findMembersFromClub(club.id);
    expect(socios.length).toBe(5);
  });

  it('findMembersFromClub should throw an exception for an invalid club', async () => {
    await expect(() =>
      service.findMembersFromClub("0"),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('updateMembersFromClub should update socios list for a club', async () => {
    const newSocio: SocioEntity =
      await socioRepository.save(getNewSocio());

    const updatedClub: ClubEntity =
      await service.updateMembersFromClub(club.id, 
        [newSocio],
      );
    expect(updatedClub.socios.length).toBe(1);

    expect(updatedClub.socios[0].nombre).toBe(newSocio.nombre,);
    expect(updatedClub.socios[0].correo).toBe(newSocio.correo,);
    expect(updatedClub.socios[0].fecha_nacimiento).toBe(newSocio.fecha_nacimiento,);
  });

  it('updateMembersFromClub should throw an exception for an invalid club', async () => {
    const newSocio: SocioEntity =
      await socioRepository.save(getNewSocio());

    await expect(() =>
      service.updateMembersFromClub("0", [newSocio]),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('updateMembersFromClub should throw an exception for an invalid socio', async () => {
    const newSocio: SocioEntity = sociosList[0];
    newSocio.id = "0";

    await expect(() =>
      service.updateMembersFromClub(club.id, [newSocio,]),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('deleteMemberFromClub should remove an socio from a club', async () => {
    const socio: SocioEntity = sociosList[0];

    await service.deleteMemberFromClub(club.id,socio.id,);

    const storedClub: ClubEntity = await clubRepository.findOne({ where: { id: club.id },relations: ['socios'],});
    const deletedSocio: SocioEntity = storedClub.socios.find((a) => a.id === club.id);

    expect(deletedSocio).toBeUndefined();
  });

  it('deleteMemberFromClub should thrown an exception for an invalid club', async () => {
    const socio: SocioEntity = sociosList[0];
    await expect(() =>
      service.deleteMemberFromClub("0", socio.id),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('deleteMemberFromClub should thrown an exception for an invalid socio', async () => {
    await expect(() =>
      service.deleteMemberFromClub(club.id, "0"),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });


  it('deleteMemberFromClub should thrown an exception for an non asocciated socio', async () => {
    const newSocio: SocioEntity =
      await socioRepository.save(getNewSocio());

    await expect(() =>
      service.deleteMemberFromClub(club.id, newSocio.id,),
    ).rejects.toHaveProperty('type', BusinessError.PRECONDITION_FAILED);
  });
});
