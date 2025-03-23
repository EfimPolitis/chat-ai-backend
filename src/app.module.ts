import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { OpenAiModule } from './openai/openai.module';

@Module({
  imports: [
    ChatModule,
    OpenAiModule,
    MulterModule.register({ limits: { fileSize: 50 * 1024 * 1024 } }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [PrismaService, AppService],
})
export class AppModule {}
