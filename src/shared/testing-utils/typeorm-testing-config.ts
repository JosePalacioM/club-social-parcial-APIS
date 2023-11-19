/* eslint-disable prettier/prettier */
/* archivo src/shared/testing-utils/typeorm-testing-config.ts*/
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocioEntity } from '../../socio/socio.entity';
import { ClubEntity } from '../../club/club.entity';
// import { ImageEntity } from 'src/image/image.entity';

export const TypeOrmTestingConfig = () => [
 TypeOrmModule.forRoot({
   type: 'sqlite',
   database: ':memory:',
   dropSchema: true,
   entities: [SocioEntity, ClubEntity,],
   synchronize: true,
   keepConnectionAlive: true
 }),
 TypeOrmModule.forFeature([SocioEntity, ClubEntity,]),
];
