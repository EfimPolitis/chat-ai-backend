import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma.service';
import axios from 'axios';
import * as FormData from 'form-data';
import { OpenAiService } from 'src/openai/openai.service';
import { ERole } from '@prisma/client';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
  ) {}

  async getUserChats(userId: string) {
    const chats = await this.prisma.chat.findMany({
      where: { userId },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return chats;
  }

  async deleteChat(chatId: string) {
    return await this.prisma.chat.delete({
      where: {
        id: chatId,
      },
    });
  }

  async getChatMessages(chatId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      isAnimated: message.isAnimated,
      createdAt: message.createdAt,
    }));
  }

  async handleText(chatId: string, userId: string, content: string) {
    if (!chatId) {
      const newChat = await this.prisma.chat.create({ data: { userId } });
      chatId = newChat.id;
    }

    const { userId: oldUser } = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (userId !== oldUser) throw new ForbiddenException('Нет доступа');

    await this.prisma.message.create({
      data: { chatId, role: ERole.user, content },
    });

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    const messages = await this.prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const aiResponse = await this.openAiService.getChatCompletion(messages);

    await this.prisma.message.create({
      data: { chatId, role: ERole.assistant, content: aiResponse },
    });

    if (messages.length === 1) {
      await this.generateChatTitle(chatId);
    }

    return { chatId, response: aiResponse };
  }

  async handleAudio(chatId: string, userId: string, file: Express.Multer.File) {
    const transcript = await this.transcribeAudio(file);

    return await this.handleText(chatId, userId, transcript);
  }

  async setAnimatedStatus(messageId: string) {
    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        isAnimated: true,
      },
    });
  }

  private async transcribeAudio(file: Express.Multer.File): Promise<string> {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const inputPath = path.join(tempDir, `${Date.now()}-input.webm`);
    const outputPath = inputPath.replace('input.webm', 'output.mp3');

    fs.writeFileSync(inputPath, file.buffer);

    try {
      await this.convertWebmToMp3(inputPath, outputPath);

      const mp3Buffer = fs.readFileSync(outputPath);

      const formData = new FormData();
      formData.append('file', mp3Buffer, {
        filename: 'audio.mp3',
        contentType: 'audio/mpeg',
      });
      formData.append('model', 'whisper-1');

      const res = await axios.post(
        'https://api.proxyapi.ru/openai/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${process.env.PROXY_API_KEY}`,
          },
        },
      );

      return res.data.text;
    } catch (error) {
      console.error('Error during audio processing', error);
      throw error;
    } finally {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
  }

  private async generateChatTitle(chatId: string) {
    const messages = await this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 2,
    });

    const userMessage = messages.find((message) => message.role === ERole.user);
    const assistantMessage = messages.find(
      (message) => message.role === ERole.assistant,
    );

    if (!userMessage || !assistantMessage) throw new BadRequestException();

    const titlePrompt = [
      {
        role: ERole.system,
        content:
          'Ты придумываешь короткие и понятные названия для чатов на основе беседы.',
      },
      {
        role: ERole.user,
        content: `Придумай короткое название чата:\nПользователь: ${userMessage.content}\nИИ: ${assistantMessage.content}`,
      },
    ];

    const title = await this.openAiService.getChatCompletion(titlePrompt);
    const trimmedTitle = title.trim().slice(0, 60);

    await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: { title: trimmedTitle || 'Новый чат' },
    });
  }

  private convertWebmToMp3(
    inputPath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .save(outputPath);
    });
  }
}
