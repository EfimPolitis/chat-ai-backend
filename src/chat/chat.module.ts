import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.service';
import { OpenAiService } from 'src/openai/openai.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, OpenAiService],
})
export class ChatModule {}
