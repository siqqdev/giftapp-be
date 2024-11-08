import { Injectable, OnModuleInit } from '@nestjs/common';
import { ActionStatus } from 'src/action/action.schema';
import { ActionService } from 'src/action/action.service';
import { HasherService } from 'src/hash/hasher.service';
import { Telegraf } from 'telegraf';
import { TelegramUserService } from './tg.user.service';
import { UserService } from 'src/user/user.service';
import { TelegramConfig, createTelegramConfig } from './bot.config';
import { InlineQueryFactory } from './bot.inline-query.factory';
import { TelegramKeyboardFactory } from './bot.keyboard.factory';
import { TelegramMessages } from './bot.messages';

@Injectable()
export class BotService {
  private readonly bot: Telegraf;
  private readonly config: TelegramConfig;
  private readonly telegramUserService: TelegramUserService;
  private readonly keyboardFactory: TelegramKeyboardFactory;
  private readonly inlineQueryFactory: InlineQueryFactory;

  constructor(
    private readonly hasherService: HasherService,
    private readonly actionService: ActionService,
    private readonly userService: UserService
  ) {
    this.config = createTelegramConfig();
    this.bot = new Telegraf(this.config.botToken);
    this.telegramUserService = new TelegramUserService(this.bot);
    this.keyboardFactory = new TelegramKeyboardFactory(this.config);
    this.inlineQueryFactory = new InlineQueryFactory(this.config);

    this.initializeBot();
  }

  private async initializeBot() {
    this.setupStartCommand();
    this.setupInlineQuery();
    
    this.bot.launch().then(() => {
      console.log('Bot started successfully');
    }).catch(err => {
      console.error('Bot launch error:', err);
    });
  }

  private setupStartCommand() {
    this.bot.command('start', async (ctx) => {
      try {
        await ctx.replyWithPhoto(
          { url: this.config.assetsUrl },
          {
            caption: TelegramMessages.welcomeMessage,
            reply_markup: this.keyboardFactory.createOpenAppKeyboard()
          }
        );
      } catch (error) {
        console.error('Error sending photo:', error);
        await ctx.reply(
          TelegramMessages.welcomeMessage,
          { reply_markup: this.keyboardFactory.createOpenAppKeyboard() }
        );
      }
    });
  }

  private setupInlineQuery() {
    this.bot.on('inline_query', async (ctx) => {
      try {
        const value = ctx.update.inline_query.query;
        const actionId = this.hasherService.decrypt(value);
        const action = await this.actionService.getActionById(actionId);
        
        if (action.status !== ActionStatus.PENDING) return;

        const item = this.inlineQueryFactory.createGiftInlineResult(action.giftName, value);
        await ctx.answerInlineQuery([item], { cache_time: 0 });
      } catch (ex) {
        console.error(ex);
      }
    });
  }

  async getUserProfile(userId: string) {
    return this.telegramUserService.getUserProfile(userId);
  }

  private async getUserFirstLastName(userId: string): Promise<string> {
    try {
      const user = await this.userService.findById(userId);
      return user.firstLastName || user.id;
    } catch (error) {
      console.error(`Failed to get username for user ${userId}:`, error);
      return userId;
    }
  }

  async notifyGiving(receiverId: string, senderId: string, giftName: string) {
    try {
      const senderName = await this.getUserFirstLastName(senderId);
      const message = TelegramMessages.createGivenMessage(senderName, giftName);

      await this.bot.telegram.sendMessage(
        receiverId,
        message,
        {
          parse_mode: 'HTML',
          reply_markup: this.keyboardFactory.createViewGiftsKeyboard()
        }
      );
    } catch (error) {
      console.error(`Failed to send giving notification to user ${receiverId}:`, error);
    }
  }

  async notifyReceiving(receiverId: string, senderId: string, giftName: string) {
    try {
      const receiverName = await this.getUserFirstLastName(receiverId);
      const message = TelegramMessages.createReceivedMessage(receiverName, giftName);

      await this.bot.telegram.sendMessage(
        senderId,
        message,
        {
          parse_mode: 'HTML',
          reply_markup: this.keyboardFactory.createOpenAppKeyboard()
        }
      );
    } catch (error) {
      console.error(`Failed to send receiving notification to user ${senderId}:`, error);
    }
  }

  async notifyPurchase(tgUserId: string, giftName: string) {
    try {
      await this.bot.telegram.sendMessage(
        tgUserId,
        TelegramMessages.createPurchaseMessage(giftName),
        {
          parse_mode: 'HTML',
          reply_markup: this.keyboardFactory.createViewGiftsKeyboard()
        }
      );
    } catch (error) {
      console.error(`Failed to send purchase notification to user ${tgUserId}:`, error);
    }
  }
}