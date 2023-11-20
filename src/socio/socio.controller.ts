/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors, } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { SocioDto } from './socio.dto';
import { SocioEntity } from './socio.entity';
import { SocioService } from './socio.service';

@Controller('socio')
@UseInterceptors(BusinessErrorsInterceptor)
export class SocioController {
    constructor(private readonly socioService: SocioService) {}

  @Post()
  async create(@Body() socioDto: SocioDto) {
    const socio: SocioEntity = plainToInstance(SocioEntity, socioDto);
    return await this.socioService.create(socio);
  }

  @Get()
  async findAll() {
    return await this.socioService.findAll();
  }


  @Get(':socioId')
  async findOne(@Param('socioId') socioId: string) {
    return await this.socioService.findOne(socioId);
  }


  @Put(':socioId')
  async update(@Param('socioId') socioId: string, @Body() socioDto: SocioDto) {
    const socio: SocioEntity = plainToInstance(SocioEntity, socioDto);
    return await this.socioService.update(socioId, socio);
  }

  @Delete(':socioId')
  @HttpCode(204)
  async delete(@Param('socioId') socioId: string) {
    return await this.socioService.delete(socioId);
  }

}
