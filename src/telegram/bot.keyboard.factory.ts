import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';
import { TelegramConfig } from './bot.config';

export class TelegramKeyboardFactory {
  constructor(private readonly config: TelegramConfig) {}

  createOpenAppKeyboard(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [[
        { text: 'Open App', web_app: { url: this.config.webAppUrl } }
      ]]
    };
  }

  createViewGiftsKeyboard(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [[
        { text: 'View My Gifts', url: `${this.config.botUrl}/app?startapp=redirect_gifts` }
      ]]
    };
  }

  createReceiveGiftKeyboard(hash: string): InlineKeyboardMarkup {
    return {
      inline_keyboard: [[
        {
          text: 'Receive Gift',
          url: `${this.config.botUrl}/app?startapp=redirect_received_gift_${encodeURIComponent(hash)}`
        }
      ]]
    };
  }
}