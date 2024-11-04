import { Injectable } from '@nestjs/common';
import { ActionService } from 'src/action/action.service';
import { HasherService } from 'src/hash/hasher.service';
import { Telegraf } from 'telegraf';
import { InlineQueryResult } from 'telegraf/typings/core/types/typegram';

export const getGiftForYouItem = (giftName: string, webAppUrl: string): InlineQueryResult => ({
  type: 'article',
  id: 'gift_for_you',
  title: 'Send Gift',
  description: `Send a gift of ${giftName}`,
  // thumbnail_url: 'YOUR_GIFT_ICON_URL', // Replace with your gift icon URL
  input_message_content: {
    message_text: 'I have a <strong>gift</strong> for you! Tap the button below to open it.',
    parse_mode: 'HTML'
  },
  reply_markup: {
    inline_keyboard: [[
      { text: 'Receive Gift', web_app: { url: webAppUrl } }
    ]]
  }
});

@Injectable()
export class BotService {
  private readonly bot: Telegraf;
  webAppUrl: string;

  constructor(
    private readonly hasherSevice: HasherService,
    private readonly actionService: ActionService
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.webAppUrl = process.env.WEB_APP_URL

    this.bot.command('start', async (ctx) => {
      await ctx.reply('🎁 Here you can buy and send gifts to your friends.', {
        reply_markup: {
          inline_keyboard: [[
            { text: 'Open App', web_app: { url: this.webAppUrl } }
          ]]
        }
      });
    });

    this.bot.on('inline_query', async (ctx) => {
      try {
        const actionId = this.hasherSevice.decrypt(ctx.update.inline_query.query)
        const action = await this.actionService.getActionById(actionId)
        const giftItem = getGiftForYouItem(action.giftName, this.webAppUrl);

        await ctx.answerInlineQuery([giftItem], {
          cache_time: 0
        });
      }
      catch { }
    });

    this.bot.launch().then(() => {
      console.log('Bot started successfully');
    }).catch(err => {
      console.error('Bot launch error:', err);
    });
  }
}