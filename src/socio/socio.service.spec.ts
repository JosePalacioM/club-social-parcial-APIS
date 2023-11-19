/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SocioEntity } from './socio.entity';
import { SocioService } from './socio.service';

import { faker } from '@faker-js/faker';
import { BusinessError } from '../shared/errors/business-errors';

describe('SocioService', () => {
  let service: SocioService;
  let repository: Repository<SocioEntity>;
  let sociosList: SocioEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [SocioService],
    }).compile();

    service = module.get<SocioService>(SocioService);
    repository = module.get<Repository<SocioEntity>>(getRepositoryToken(SocioEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    repository.clear();
    sociosList = [];
    for (let i = 0; i < 5; i++) {
      const socio: SocioEntity =
        await repository.save({
          nombre: faker.company.name(),
          correo: faker.internet.email(),
          fecha_nacimiento: faker.date.past(),
          })
          sociosList.push(socio);
    }
  };
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all socios', async () => {
    const socios: SocioEntity[] = await service.findAll();
    expect(socios).not.toBeNull();
    expect(socios).toHaveLength(sociosList.length);
  });
  
  it('findOne should return a socio by id', async () => {
    const storedSocio: SocioEntity = sociosList[0];
    const socio: SocioEntity = await service.findOne(storedSocio.id);
    expect(socio).not.toBeNull();
    expect(socio.nombre).toEqual(storedSocio.nombre)
  });

  it('findOne should throw an exception for an invalid socio', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "El socio con id 0 no existe")
  });

  it('create should return a new socio', async () => {
    const socio: SocioEntity = {
      id: "",
      nombre: faker.company.name(),
      correo: faker.internet.email(),
      fecha_nacimiento: faker.date.past(),
      clubs: [],
    };

    const newSocio: SocioEntity = await service.create(socio);
    expect(newSocio).not.toBeNull();

    const storedSocio: SocioEntity = await repository.findOne({
      where: { id: newSocio.id },
    });
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toEqual(newSocio.nombre);
  });

  it('update should modify a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    socio.nombre = 'New name';

    const updatedSocio: SocioEntity = await service.update(
      socio.id,
      socio,
    );
    expect(updatedSocio).not.toBeNull();

    const storedSocio: SocioEntity = await repository.findOne({
      where: { id: socio.id },
    });
    expect(storedSocio).not.toBeNull();
    expect(storedSocio.nombre).toEqual(socio.nombre);
  });

  it('update should throw an exception for an invalid socio', async () => {
    let socio: SocioEntity = sociosList[0];
    socio = {
      ...socio,
      nombre: 'New name',
    };
    await expect(() => service.update("0", socio)).rejects.toHaveProperty(
      'type',
      BusinessError.NOT_FOUND,
    );
  });

  it('delete should remove a socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);

    const deletedSocio: SocioEntity = await repository.findOne({where: { id: socio.id },});
    expect(deletedSocio).toBeNull();
  });

  it('delete should throw an exception for an invalid socio', async () => {
    const socio: SocioEntity = sociosList[0];
    await service.delete(socio.id);
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "El socio con id 0 no existe");
  });
});
