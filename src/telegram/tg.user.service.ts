import { Injectable } from "@nestjs/common";
import { Telegraf } from "telegraf";
import { Chat } from "telegraf/typings/core/types/typegram";

interface PhotoUrls {
    small: string | null;
    large: string | null;
}

export interface TelegramUserProfile {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    photos: PhotoUrls;
    isPremium: boolean;
}

@Injectable()
export class TelegramUserService {
  constructor(private readonly bot: Telegraf) {}

  private async getPhotoUrl(fileId: string): Promise<string | null> {
    try {
      const file = await this.bot.telegram.getFile(fileId);
      if (file.file_path) {
        return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
      }
      return null;
    } catch (error) {
      console.error('Failed to get photo URL:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<TelegramUserProfile | null> {
    try {
      const chat = await this.bot.telegram.getChat(userId) as Chat.PrivateChat;
      
      if (!chat || !('first_name' in chat)) {
        return null;
      }

      let photos: PhotoUrls = {
        small: null,
        large: null
      };

      // Get profile photos if available
      try {
        const userPhotos = await this.bot.telegram.getUserProfilePhotos(Number(userId), 0, 1);
        if (userPhotos && userPhotos.total_count > 0) {
          const photoSizes = userPhotos.photos[0];
          
          // Get smallest size photo (160x160)
          if (photoSizes.length > 0) {
            const smallPhoto = photoSizes[0];
            photos.small = await this.getPhotoUrl(smallPhoto.file_id);
          }
          
          // Get largest size photo (640x640)
          if (photoSizes.length > 1) {
            const largePhoto = photoSizes[photoSizes.length - 1];
            photos.large = await this.getPhotoUrl(largePhoto.file_id);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch profile photos for user ${userId}:`, error);
      }

      // Get premium status
      let isPremium = false;
      try {
        const member = await this.bot.telegram.getChatMember(userId, Number(userId));
        isPremium = 'is_premium' in member.user ? !!member.user.is_premium : false;
      } catch (error) {
        console.error(`Failed to fetch premium status for user ${userId}:`, error);
      }

      return {
        id: userId,
        firstName: chat.first_name || null,
        lastName: chat.last_name || null,
        username: chat.username || null,
        photos,
        isPremium
      };
    } catch (error) {
      console.error(`Failed to fetch user profile for ${userId}:`, error);
      return null;
    }
  }
}