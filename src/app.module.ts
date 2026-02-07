import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { NoticesModule } from './notices/notices.module';

@Module({
  imports: [PrismaModule, NoticesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
