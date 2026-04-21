import { Injectable, Logger } from '@nestjs/common';
import { PersonalizeRuntimeClient, GetRecommendationsCommand } from '@aws-sdk/client-personalize-runtime';

@Injectable()
export class PersonalizeService {
  private personalizeClient: PersonalizeRuntimeClient;
  private readonly logger = new Logger(PersonalizeService.name);

  constructor() {
    this.personalizeClient = new PersonalizeRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async getRecommendations(userId: string, limit: number = 10) {
    try {
      const command = new GetRecommendationsCommand({
        campaignArn: process.env.PERSONALIZE_CAMPAIGN_ARN,
        userId: userId,
        numResults: limit,
      });

      const response = await this.personalizeClient.send(command);
      return response.itemList?.map((item: any) => item.itemId) || [];
    } catch (error) {
      this.logger.error('Error getting recommendations:', error);
      return [];
    }
  }

  async getSimilarItems(itemId: string, limit: number = 10) {
    try {
      const command = new GetRecommendationsCommand({
        campaignArn: process.env.PERSONALIZE_CAMPAIGN_ARN,
        itemId: itemId,
        numResults: limit,
      });

      const response = await this.personalizeClient.send(command);
      return response.itemList?.map((item: any) => item.itemId) || [];
    } catch (error) {
      this.logger.error('Error getting similar items:', error);
      return [];
    }
  }

  async trackEvent(userId: string, eventType: string, itemId: string, sessionId?: string) {
    try {
      // Usar fetch directamente para PutEvents
      const response = await fetch(`https://personalize-events.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Amz-Target': 'AmazonPersonalize.PutEvents',
        },
        body: JSON.stringify({
          trackingId: process.env.PERSONALIZE_TRACKING_ID,
          userId: userId,
          sessionId: sessionId || `session-${Date.now()}`,
          eventList: [
            {
              eventId: `${Date.now()}-${Math.random()}`,
              eventType: eventType,
              sentAt: new Date().toISOString(),
              itemId: itemId,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.logger.log(`Event tracked: ${eventType} for user ${userId} on item ${itemId}`);
    } catch (error) {
      this.logger.error('Error tracking event:', error);
    }
  }
}