import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { sendMessageDto } from './dto/sendMessage.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':userId')
  async getChats(@Param('userId') userId: string) {
    return this.chatService.getUserChats(userId);
  }

  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: string) {
    return this.chatService.deleteChat(chatId);
  }

  @Get('message/:chatId')
  async getMessages(@Param('chatId') chatId: string) {
    if (!chatId)
      throw new BadRequestException('Отсутствует индентификатор чата');
    return this.chatService.getChatMessages(chatId);
  }

  @Post('message')
  @UseInterceptors(FileInterceptor('file'))
  async sendMessage(
    @Query('type') type: 'text' | 'audio',
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: sendMessageDto,
  ) {
    const { chatId, userId, content } = dto;

    if (type === 'audio') {
      if (!file) throw new BadRequestException('Аудио файл не был получен');
      return await this.chatService.handleAudio(chatId, userId, file);
    }

    if (type === 'text') {
      if (!content)
        throw new BadRequestException('Текст сообщения не может быть пустым!');
      return await this.chatService.handleText(chatId, userId, content);
    }

    throw new BadRequestException('Неверное наименование type для сообщения');
  }

  @Post('message-set-animated-status/:messageId')
  async setAnimatedStatus(@Param('messageId') messageId: string) {
    return this.chatService.setAnimatedStatus(messageId);
  }
}
