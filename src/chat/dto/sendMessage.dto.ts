import { IsOptional, IsString } from 'class-validator';

export class sendMessageDto {
  @IsString()
  @IsOptional()
  chatId?: string;

  @IsString()
  userId: string;

  @IsString()
  content: string;
}
