import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.PROXY_API_KEY,
      baseURL: 'https://api.proxyapi.ru/openai/v1',
    });
  }

  async getChatCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        max_completion_tokens: 1000,
        messages,
      });

      return response.choices[0].message?.content || '';
    } catch (error) {
      if (error && error.error.message) {
        throw new HttpException(
          `${error.error.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        'Неизвестная ошибка сервера',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
