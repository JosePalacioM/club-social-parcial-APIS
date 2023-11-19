import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocioModule } from './socio/socio.module';
import { ClubModule } from './club/club.module';

@Module({
  imports: [SocioModule, ClubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
