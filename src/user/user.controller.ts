import { Controller, Get, Param, BadRequestException, DefaultValuePipe, ParseIntPipe, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.schema";
import { BoughtGift, SendedGift } from "src/gift/gift.schema";
import { USER_ID_REGEX } from "src/utils/userid.regex";
import { AuthUser } from "src/auth/auth.guard";
import { GetUser } from "src/auth/auth.decorator";
import { LeaderboardResponseDto } from "./user.dto";

@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Get('me')
    async getMe(@GetUser() user: AuthUser){
        if (!USER_ID_REGEX.test(user.id)) {
            throw new BadRequestException('User ID is invalid');
        }
        return this.usersService.findByIdOrCreate(user)
    }

    @Get('bought-gifts')
    async getUserBoughtGifts(@GetUser() user: AuthUser): Promise<BoughtGift[]> {
        if (!USER_ID_REGEX.test(user.id)) {
            throw new BadRequestException('User ID is invalid');
        }

        return await this.usersService.getBoughtGifts(user.id);
    }

    @Get('leaderboard')
    async getLeaderboard(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
        @GetUser() user: AuthUser
    ): Promise<LeaderboardResponseDto> {
        if (page < 1) {
            throw new BadRequestException('Page should be >= 1');
        }
        if (limit < 5) {
            throw new BadRequestException('Limit should be at least 5');
        }
        if (limit > 50) {
            throw new BadRequestException('Limit cannot exceed 50');
        }

        return this.usersService.getLeaderboard(page, limit, user.id);
    }

    @Get(':id')
    async getUser(@Param('id') id: string): Promise<User> {
        if (!USER_ID_REGEX.test(id)) {
            throw new BadRequestException('User ID is invalid');
        }
        return this.usersService.findById(id);
    }

    @Get(':id/received-gifts')
    async getUserReceivedGifts(@Param('id') id: string): Promise<SendedGift[]> {
        if (!USER_ID_REGEX.test(id)) {
            throw new BadRequestException('User ID is invalid');
        }

        return await this.usersService.getReceivedGifts(id);
    }
}