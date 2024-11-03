import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { InlineQueryResult } from 'telegraf/typings/core/types/typegram';

const WEB_APP_URL = process.env.WEB_APP_URL

export const getGiftForYouItem = (giftName: string): InlineQueryResult => ({
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
        { text: 'Receive Gift', web_app: { url: WEB_APP_URL } }
      ]]
    }
  });
  
@Injectable()
export class BotService {
    private readonly bot: Telegraf;

    constructor() {
        this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

        this.bot.command('start', async (ctx) => {
            await ctx.reply('🎁 Here you can buy and send gifts to your friends.', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: 'Open App', web_app: { url: 'srgrd' } }
                    ]]
                }
            });
        });

        this.bot.on('inline_query', async (ctx) => {
            const giftItem = getGiftForYouItem("CaKA");
            await ctx.answerInlineQuery([giftItem], {
              cache_time: 0
            });
          });

        this.bot.launch().then(() => {
            console.log('Bot started successfully');
        }).catch(err => {
            console.error('Bot launch error:', err);
        });
    }
}