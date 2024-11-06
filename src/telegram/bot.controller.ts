import { BadRequestException, Controller, Get, NotFoundException, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegramUserProfile } from './tg.user.service';
import { CacheService } from 'src/cache/cache.service';
import axios from 'axios';
import { Response } from 'express';
import { USER_ID_REGEX } from 'src/utils/userid.regex';

@Controller('telegram')
export class BotController {
    private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly PREMIUM_CACHE_TTL = 60 * 60 * 1000; // 1 hour

    constructor(
        private readonly botService: BotService,
        private readonly cacheService: CacheService
    ) {}

    @Get('user/:userId')
    async getUserProfile(
        @Param('userId') userId: string,
        @Query('refresh') refresh?: string
    ) {
        if (!USER_ID_REGEX.test(userId)) {
            throw new BadRequestException('User ID is invalid');
        }
        
        const cacheKey = `telegram:user:${userId}`;
        const forceRefresh = refresh === 'true';

        if (!forceRefresh) {
            const cachedProfile = this.cacheService.get<TelegramUserProfile>(cacheKey);
            if (cachedProfile) {
                return cachedProfile;
            }
        }

        const profile = await this.botService.getUserProfile(userId);

        if(!profile){
            throw new NotFoundException("Could not find telegram user")
        }
        
        if (profile) {
            const ttl = profile.isPremium ? this.PREMIUM_CACHE_TTL : this.DEFAULT_CACHE_TTL;
            this.cacheService.set(cacheKey, profile, ttl);
        }

        return profile;
    }

    @Get('image/:filePath(*)')  // (*) allows slashes in path parameter
    async getImage(
        @Param('filePath') filePath: string,
        @Res() response: Response
    ) {
        if (!filePath) {
            throw new BadRequestException('File path is required');
        }

        try {
            const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
            
            const { data, headers } = await axios.get(imageUrl, {
                responseType: 'stream'
            });

            response.setHeader('Content-Type', headers['content-type']);
            response.setHeader('Content-Length', headers['content-length']);
            response.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache

            return data.pipe(response);
        } catch (error) {
            console.error('Error fetching image:', error);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                response.status(404).send('Image not found');
            } else {
                response.status(500).send('Error fetching image');
            }
        }
    }
}