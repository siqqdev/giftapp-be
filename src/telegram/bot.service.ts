import { Injectable } from '@nestjs/common';
import * as path from "path";
import * as fs from 'fs';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class BotService {
    private readonly bot: Telegraf;

    constructor() {
        this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

        this.bot.command('start', (ctx) => {
            try {
                const startPayload = ctx.message.text.split(' ')[1];
                const userId = startPayload?.split('_')[1]
            } catch (error) {
                console.error(error)
            }

        });

        this.bot.on('text', (ctx: Context) => this.handleText(ctx, 'Привет!\nНажми кнопку чтобы запустить игру'));

        this.bot.launch().then(() => {
            console.log('Bot started successfully');
        }).catch(err => {
            console.error('Bot launch error:', err);
        });
    }

    private async downloadAndSaveAvatar(fileUrl: string, userId: string): Promise<string | undefined> {
        try {
            const response = await fetch(fileUrl);
            const buffer = await response.arrayBuffer();

            const filename = `avatar_${userId}.jpg`;
            const filePath = path.join(process.cwd(), 'uploads', filename);

            this.ensureUploadsDirectoryExists();

            fs.writeFileSync(filePath, Buffer.from(buffer));

            return `/uploads/${filename}`;
        } catch (error) {
            console.error('Error downloading and saving avatar:', error);
            return undefined;
        }
    }

    private ensureUploadsDirectoryExists(): void {
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    }

    private async fetchUserAvatar(ctx: Context): Promise<string | undefined> {
        try {
            const userPhotos = await ctx.telegram.getUserProfilePhotos(ctx.message.chat.id, 0, 1);
            if (userPhotos && userPhotos.total_count > 0) {
                const fileId = userPhotos.photos[0][0].file_id;
                const fileInfo = await ctx.telegram.getFile(fileId);
                const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
                return fileUrl;
            }
        } catch (error) {
            console.error('Error fetching user avatar:', error);
        }
        return undefined;
    }

    private async handleText(ctx: Context, message: string): Promise<void> {
        // Reply with "Hello" to every text message
        const chatId = ctx.message.chat.id;
        const webAppUrl = 'https://dev.dair.site/'; // Replace with your actual web app URL

        await this.bot.telegram.sendMessage(chatId.toString(), message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Играть', web_app: { url: webAppUrl } }],
                ],
            },
        });
    }

    async checkUserSubscription(userId: number, chatId: string): Promise<boolean> {
        try {
            const chatMember = await this.bot.telegram.getChatMember(chatId, userId);
            
            // Check if the user's status indicates they are a member
            const isSubscribed = ['creator', 'administrator', 'member'].includes(chatMember.status);
            
            return isSubscribed;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return false;
        }
    }
}