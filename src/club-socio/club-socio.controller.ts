/* eslint-disable prettier/prettier */
import {Body,Controller,Delete,Get,HttpCode,HttpStatus,Param,ParseIntPipe,Post,Put,UseInterceptors,} from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ClubSocioService } from './club-socio.service';
import { SocioDto } from 'src/socio/socio.dto';
import { plainToInstance } from 'class-transformer';
import { SocioEntity } from 'src/socio/socio.entity';

@Controller('culturas-gastronomicas')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClubSocioController {
  constructor(
    private readonly clubSocioService: ClubSocioService,
  ) {}

  @Post(':clubId/socios/:socioId')
  async addSocioClub(
    @Param('clubId', ParseIntPipe) clubId: string,
    @Param('socioId', ParseIntPipe) socioId: string,
  ) {
    return await this.clubSocioService.addMemberToClub(
      clubId,
      socioId,
    );
  }

  @Get(':clubId/socios/:socioId')
  async findSocioByclubIdsocioId(
    @Param('clubId', ParseIntPipe) clubId: string,
    @Param('socioId', ParseIntPipe) socioId: string,
  ) {
    return await this.clubSocioService.findMemberFromClub(
      clubId,
      socioId,
    );
  }

  @Get(':clubId/socios')
  async findSocioesByClubId(
    @Param('clubId', ParseIntPipe) clubId: string,
  ) {
    return await this.clubSocioService.findMembersFromClub(
      clubId,
    );
  }

  @Put(':clubId/socios')
  async associateSocioesClub(
    @Body() socioDto: SocioDto[],
    @Param('clubId', ParseIntPipe) clubId: string,
  ) {
    const socios = plainToInstance(SocioEntity, socioDto);
    return await this.clubSocioService.updateMembersFromClub(
      clubId,
      socios,
    );
  }

  @Delete(':clubId/socios/:socioId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSocioClub(
    @Param('clubId', ParseIntPipe) clubId: string,
    @Param('socioId', ParseIntPipe) socioId: string,
  ) {
    return await this.clubSocioService.deleteMemberFromClub(
      clubId,
      socioId,
    );
  }
}
