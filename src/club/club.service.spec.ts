/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ClubEntity } from './club.entity';
import { ClubService } from './club.service';

import { faker } from '@faker-js/faker';
import { BusinessError } from '../shared/errors/business-errors';

describe('ClubService', () => {
  let service: ClubService;
  let repository: Repository<ClubEntity>;
  let clubsList: ClubEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ClubService],
    }).compile();

    service = module.get<ClubService>(ClubService);
    repository = module.get<Repository<ClubEntity>>(getRepositoryToken(ClubEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    clubsList = [];
    for (let i = 0; i < 5; i++) {
      const club: ClubEntity =
        await repository.save({
          nombre: faker.company.name(),
          fecha_fundacion: faker.date.past(),
          imagen: faker.lorem.paragraph(),
          descripcion: faker.lorem.paragraph()})
          clubsList.push(club);
    }
  };
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all clubs', async () => {
    const clubs: ClubEntity[] = await service.findAll();
    expect(clubs).not.toBeNull();
    expect(clubs).toHaveLength(clubsList.length);
  });
  
  it('findOne should return a club by id', async () => {
    const storedClub: ClubEntity = clubsList[0];
    const club: ClubEntity = await service.findOne(storedClub.id);
    expect(club).not.toBeNull();
    expect(club.nombre).toEqual(storedClub.nombre)
  });

  it('findOne should throw an exception for an invalid club', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "El club con id 0 no existe")
  });

  it('create should return a new club', async () => {
    const club: ClubEntity = {
      id: "",
      nombre: faker.company.name(),
      fecha_fundacion: faker.date.past(),
      imagen: faker.lorem.paragraph(),
      descripcion: faker.lorem.paragraph(),
      socios: [],
    };

    const newClub: ClubEntity = await service.create(club);
    expect(newClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: newClub.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(newClub.nombre);
  });

  it('update should modify a club', async () => {
    const club: ClubEntity = clubsList[0];
    club.nombre = 'New name';

    const updatedClub: ClubEntity = await service.update(
      club.id,
      club,
    );
    expect(updatedClub).not.toBeNull();

    const storedClub: ClubEntity = await repository.findOne({
      where: { id: club.id },
    });
    expect(storedClub).not.toBeNull();
    expect(storedClub.nombre).toEqual(club.nombre);
  });

  it('update should throw an exception for an invalid club', async () => {
    let club: ClubEntity = clubsList[0];
    club = {
      ...club,
      nombre: 'New name',
    };
    await expect(() => service.update("0", club)).rejects.toHaveProperty(
      'type',
      BusinessError.NOT_FOUND,
    );
  });

  it('delete should remove a club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);

    const deletedClub: ClubEntity = await repository.findOne({where: { id: club.id },});
    expect(deletedClub).toBeNull();
  });

  it('delete should throw an exception for an invalid club', async () => {
    const club: ClubEntity = clubsList[0];
    await service.delete(club.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "El club con id 0 no existe");
  });
});
