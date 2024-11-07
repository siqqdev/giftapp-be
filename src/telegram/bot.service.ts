import { Injectable } from '@nestjs/common';
import { ActionStatus } from 'src/action/action.schema';
import { ActionService } from 'src/action/action.service';
import { HasherService } from 'src/hash/hasher.service';
import { Telegraf } from 'telegraf';
import { InlineQueryResult, InlineQueryResultArticle } from 'telegraf/typings/core/types/typegram';
import { TelegramUserService } from './tg.user.service';
import { UserService } from 'src/user/user.service';

const createGiftInlineResult = (giftName: string, webAppUrl: string, hash: string): InlineQueryResultArticle => ({
  type: 'article',
  id: Date.now().toString(),
  title: 'Send Gift',
  description: `Send a gift of ${giftName}`,
  // thumb_url: 'https://your-domain.com/gift-icon.png', // Optional: Add your gift icon
  input_message_content: {
    message_text: `🎁 I have a gift for you! Tap the button below to open it.`,
    parse_mode: 'HTML'
  },
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'Receive Gift',
          url: `https://t.me/cbcontest_giftapp_bot/app?start_param=${encodeURIComponent(hash)}`
          // callback_data: 'receive_gift'
          // web_app: { url: `https://giftapp-fe.vercel.app/receive-gift-success/${encodeURIComponent(hash)}` }
        }
      ]
    ]
  }
});

@Injectable()
export class BotService {
  private readonly bot: Telegraf;
  webAppUrl: string;
  private readonly telegramUserService: TelegramUserService;

  constructor(
    private readonly hasherSevice: HasherService,
    private readonly actionService: ActionService,
    private readonly userService: UserService
  ) {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.webAppUrl = process.env.WEB_APP_URL
    this.telegramUserService = new TelegramUserService(this.bot);

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
        const value = ctx.update.inline_query.query
        const actionId = this.hasherSevice.decrypt(value)
        const action = await this.actionService.getActionById(actionId)
        if (action.status !== ActionStatus.PENDING) {
          return
        }

        const item: InlineQueryResult = createGiftInlineResult(action.giftName, "https://t.me/giftappdevbot/app", value)

        await ctx.answerInlineQuery([item], {
          cache_time: 0
        });
      }
      catch (ex) {
        console.error(ex)
      }
    });

    this.bot.launch().then(() => {
      console.log('Bot started successfully');
    }).catch(err => {
      console.error('Bot launch error:', err);
    });
  }

  async getUserProfile(userId: string) {
    const profile = await this.telegramUserService.getUserProfile(userId)

    return profile;
  }

  async notifyGiving(receiverId: string, senderId: string, giftName: string) {
    try {
      await this.bot.telegram.sendMessage(
        receiverId,
        `⚡ ${await this.getUserFirstLastName(senderId)} has given you the gift of ${giftName}.`
      );
    } catch (error) {
      console.error(`Failed to send giving notification to user ${receiverId}:`, error);
    }
  }

  async notifyReceiving(receiverId: string, senderId: string, giftName: string) {
    try {
      const message = `🔥 ${await this.getUserFirstLastName(receiverId)} received your gift of ${giftName}.`

      await this.bot.telegram.sendMessage(senderId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: 'View My Gifts', web_app: { url: `${this.webAppUrl}/gifts` } }
          ]]
        }
      });
    } catch (error) {
      console.error(`Failed to send receiving notification to user ${senderId}:`, error);
    }
  }

  async notifyPurchase(tgUserId: string, giftName: string) {
    try {
      await this.bot.telegram.sendMessage(
        tgUserId,
        `✅ You have purchased the gift of ${giftName}.`,
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[
              {
                text: 'View my gifts',
                url: `https://t.me/cbcontest_giftapp_bot/app`
                // callback_data: 'receive_gift'
                // web_app: { url: "" }
              }
            ]]
          }
        }
      );
    } catch (error) {
      console.error(`Failed to send purchase notification to user ${tgUserId}:`, error);
    }
  }

  async getUserFirstLastName(userId: string): Promise<string | null> {
    try {
      const user = await this.userService.findById(userId);
      
      if(user.firstLastName)
        return user.firstLastName
      else
        return user.id
    } catch (error) {
      console.error(`Failed to get username for user ${userId}:`, error);
      return null;
    }
  }
}