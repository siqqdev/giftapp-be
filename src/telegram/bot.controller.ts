import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { BotService } from './bot.service';
import { TelegramUserProfile } from './tg.user.service';
import { CacheService } from 'src/cache/cache.service';

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
}