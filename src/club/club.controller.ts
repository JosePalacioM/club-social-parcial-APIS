/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors, ParseIntPipe, } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ClubDto } from './club.dto';
import { ClubEntity } from './club.entity';
import { ClubService } from './club.service';

@Controller('club')
@UseInterceptors(BusinessErrorsInterceptor)
export class ClubController {
    constructor(private readonly clubService: ClubService) {}

  @Post()
  async create(@Body() clubDto: ClubDto) {
    const club: ClubEntity = plainToInstance(ClubEntity, clubDto);
    return await this.clubService.create(club);
  }

  @Get()
  async findAll() {
    return await this.clubService.findAll();
  }


  @Get(':clubId')
  async findOne(@Param('clubId', ParseIntPipe) clubId: string) {
    return await this.clubService.findOne(clubId);
  }


  @Put(':clubId')
  async update(@Param('clubId') clubId: string, @Body() clubDto: ClubDto) {
    const club: ClubEntity = plainToInstance(ClubEntity, clubDto);
    return await this.clubService.update(clubId, club);
  }

  @Delete(':clubId')
  @HttpCode(204)
  async delete(@Param('clubId') clubId: string) {
    return await this.clubService.delete(clubId);
  }

}
