import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { GetRecommendationsDto, GetPersonalizedRecommendationsDto, TrackEventDto } from './dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('recommendations')
  @UseGuards(AuthGuard('jwt'))
  async getRecommendations(@Request() req, @Query() dto: GetPersonalizedRecommendationsDto) {
    return this.aiService.getPersonalizedRecommendations(req.user.id, dto.limit);
  }

  @Get('similar')
  async getSimilarProducts(@Query() dto: GetRecommendationsDto) {
    if (!dto.itemId) {
      return { products: [] };
    }
    return this.aiService.getSimilarProducts(dto.itemId, dto.limit);
  }

  @Post('track')
  @UseGuards(AuthGuard('jwt'))
  async trackEvent(@Request() req, @Body() dto: TrackEventDto) {
    return this.aiService.trackEvent(req.user.id, dto.eventType, dto.itemId, dto.sessionId);
  }
}