import { InlineQueryResultArticle } from 'telegraf/typings/core/types/typegram';
import { TelegramConfig } from './bot.config';
import { TelegramKeyboardFactory } from './bot.keyboard.factory';
import { TelegramMessages } from './bot.messages';

export class InlineQueryFactory {
  constructor(private readonly config: TelegramConfig) {}

  createGiftInlineResult(giftName: string, hash: string): InlineQueryResultArticle {
    return {
      type: 'article',
      id: Date.now().toString(),
      title: 'Send Gift',
      description: `Send a gift of ${giftName}`,
      thumbnail_url: this.config.assetsUrl,
      input_message_content: {
        message_text: TelegramMessages.giftSentMessage,
        parse_mode: 'HTML'
      },
      reply_markup: new TelegramKeyboardFactory(this.config).createReceiveGiftKeyboard(hash)
    };
  }
}