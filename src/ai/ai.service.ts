import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { PersonalizeService } from './personalize.service';

@Injectable()
export class AiService {
  constructor(
    private productsService: ProductsService,
    private personalizeService: PersonalizeService,
  ) {}

  async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    const recommendedIds = await this.personalizeService.getRecommendations(userId, limit);
    
    if (recommendedIds.length === 0) {
      return this.getFallbackRecommendations(limit);
    }

    const products = await Promise.all(
      recommendedIds.map(async (id) => {
        try {
          return await this.productsService.findOne(id);
        } catch {
          return null;
        }
      })
    );

    return products.filter(p => p && p.activo);
  }

  async getSimilarProducts(productId: string, limit: number = 10) {
    const similarIds = await this.personalizeService.getSimilarItems(productId, limit);
    
    if (similarIds.length === 0) {
      return this.getCategoryFallback(productId, limit);
    }

    const products = await Promise.all(
      similarIds.map(async (id) => {
        try {
          return await this.productsService.findOne(id);
        } catch {
          return null;
        }
      })
    );

    return products.filter(p => p && p.activo && p.id !== productId);
  }

  async getFallbackRecommendations(limit: number = 10) {
    const products = await this.productsService.findAll({
      page: 1,
      limit,
      sortBy: 'vendidos',
      sortOrder: 'DESC',
    });
    return products.products;
  }

  async getCategoryFallback(productId: string, limit: number = 10) {
    const product = await this.productsService.findOne(productId);
    const products = await this.productsService.findAll({
      categoria: product.categoria,
      page: 1,
      limit: limit + 1,
      sortBy: 'vendidos',
      sortOrder: 'DESC',
    });
    return products.products.filter(p => p.id !== productId).slice(0, limit);
  }

  async trackEvent(userId: string, eventType: string, itemId: string, sessionId?: string) {
    await this.personalizeService.trackEvent(userId, eventType, itemId, sessionId);
    return { message: 'Event tracked successfully' };
  }
}