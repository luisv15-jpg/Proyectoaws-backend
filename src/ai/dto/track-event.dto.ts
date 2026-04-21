import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class TrackEventDto {
  @IsNotEmpty()
  @IsString()
  eventType!: string; // 'view', 'click', 'purchase'

  @IsNotEmpty()
  @IsString()
  itemId!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}