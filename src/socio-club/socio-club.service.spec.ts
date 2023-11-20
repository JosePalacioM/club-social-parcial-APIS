/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocioClubService } from './socio-club.service';
import { SocioEntity } from '../socio/socio.entity';
import { ClubEntity } from '../club/club.entity';
import { faker } from '@faker-js/faker';
import { BusinessError } from '../shared/errors/business-errors';

describe('SocioClubService', () => {
  let service: SocioClubService;
  let clubRepository: Repository<ClubEntity>;
  let socioRepository: Repository<SocioEntity>;
  let socio: SocioEntity;
  let clubsList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioClubService],
    }).compile();

    service = module.get<SocioClubService>(
      SocioClubService,
    );
    socioRepository = module.get<Repository<SocioEntity>>(
      getRepositoryToken(SocioEntity),
    );
    clubRepository = 
      module.get<Repository<ClubEntity>>(
        getRepositoryToken(ClubEntity),
      );

    await seedDatabase();
  });

  const seedDatabase = async () => {
    clubRepository.clear();
    socioRepository.clear();

    clubsList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity =
        await clubRepository.save(getNewClub());
      clubsList.push(club);
    }

    socio = await socioRepository.save(
      getNewSocio(clubsList),
    );
  };

  const getNewClub = (): any => {
    return {
      nombre: faker.company.name(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      socios: [],
    };
  };

  const getNewSocio = (
    clubsList: ClubEntity[] = [],
  ): any => {
    return {
      nombre: faker.company.name(),
      historia: faker.lorem.sentence(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      clubs: clubsList,
    };
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addClubSocio should add a club to a socio', async () => {
    const newClub: ClubEntity =
      await clubRepository.save(getNewClub());

    const newSocio: SocioEntity = await socioRepository.save(getNewSocio(),);

    const result: SocioEntity = await service.addClubSocio(newSocio.id, newClub.id,);

    expect(result.clubs.length).toBe(1);
    expect(result.clubs[0]).not.toBeNull();
    expect(result.clubs[0].nombre).toBe(newClub.nombre,);
    expect(result.clubs[0].imagen).toBe(newClub.imagen,);
    expect(result.clubs[0].fecha_fundacion).toEqual(newClub.fecha_fundacion,);
  });

  it('addClubSocio should thrown exception for an invalid club', async () => {
    const newSocio: SocioEntity = await socioRepository.save(
      getNewSocio(),
    );

    await expect(() =>
      service.addClubSocio(newSocio.id, "0"),
    ).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('addClubSocio should throw an exception for an invalid socio', async () => {
    const newClub: SocioEntity = await clubRepository.save(getNewClub());

    await expect(() =>
      service.addClubSocio("0", newClub.id),
    ).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('findClubBysocioIdclubId should return club by socio', async () => {
    const club: ClubEntity = clubsList[0];
    const storedClub: ClubEntity = await service.findClubBysocioIdclubId(socio.id,club.id,);
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toBe(club.nombre);
    expect(storedClub.imagen).toBe(club.imagen,);
    expect(storedClub.fecha_fundacion).toEqual(club.fecha_fundacion,);
  });

  it('findClubBysocioIdclubId should throw an exception for an invalid club', async () => {
    const club: ClubEntity = clubsList[0];
    await expect(() =>
      service.findClubBysocioIdclubId("0",club.id,),
    ).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('findClubBysocioIdclubId should throw an exception for an invalid socio', async () => {
    await expect(() =>
      service.findClubBysocioIdclubId(socio.id,"0",),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('findClubBysocioIdclubId should throw an exception for an club not associated to the socio', async () => {
    const newClub: ClubEntity =
      await clubRepository.save(getNewClub());

    await expect(() =>
      service.findClubBysocioIdclubId(socio.id,newClub.id,),).rejects.toHaveProperty('type', BusinessError.PRECONDITION_FAILED);
  });

  it('findClubsBySocioId should return club by socios', async () => {
    const clubs: ClubEntity[] =  await service.findClubsBySocioId(socio.id);
    expect(clubs.length).toBe(5);
  });

  it('findClubsBySocioId should throw an exception for an invalid socio', async () => {
    await expect(() =>
      service.findClubsBySocioId("0"),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('associateClubsSocio should update clubs list for a socio', async () => {
    const newClub: ClubEntity =
      await clubRepository.save(getNewClub());

    const updatedSocio: SocioEntity =
      await service.associateClubsSocio(socio.id, 
        [newClub],
      );
    expect(updatedSocio.clubs.length).toBe(1);

    expect(updatedSocio.clubs[0].nombre).toBe(newClub.nombre,);
    expect(updatedSocio.clubs[0].imagen).toBe(newClub.imagen,);
    expect(updatedSocio.clubs[0].fecha_fundacion).toBe(newClub.fecha_fundacion,);
  });

  it('associateClubsSocio should throw an exception for an invalid socio', async () => {
    const newClub: ClubEntity =
      await clubRepository.save(getNewClub());

    await expect(() =>
      service.associateClubsSocio("0", [newClub]),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('associateClubsSocio should throw an exception for an invalid club', async () => {
    const newClub: ClubEntity = clubsList[0];
    newClub.id = "0";

    await expect(() =>
      service.associateClubsSocio(socio.id, [newClub,]),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('deleteClubSocio should remove an club from a socio', async () => {
    const club: ClubEntity = clubsList[0];

    await service.deleteClubSocio(socio.id,club.id,);

    const storedSocio: SocioEntity = await socioRepository.findOne({ where: { id: socio.id },relations: ['clubs'],});
    const deletedClub: ClubEntity = storedSocio.clubs.find((a) => a.id === socio.id);

    expect(deletedClub).toBeUndefined();
  });

  it('deleteClubSocio should thrown an exception for an invalid socio', async () => {
    const club: ClubEntity = clubsList[0];
    await expect(() =>
      service.deleteClubSocio("0", club.id),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });

  it('deleteClubSocio should thrown an exception for an invalid club', async () => {
    await expect(() =>
      service.deleteClubSocio(socio.id, "0"),).rejects.toHaveProperty('type', BusinessError.NOT_FOUND);
  });


  it('deleteClubSocio should thrown an exception for an non asocciated club', async () => {
    const newClub: ClubEntity =
      await clubRepository.save(getNewClub());

    await expect(() =>
      service.deleteClubSocio(socio.id, newClub.id,),
    ).rejects.toHaveProperty('type', BusinessError.PRECONDITION_FAILED);
  });
});
