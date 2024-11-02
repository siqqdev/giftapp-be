import { Controller, Get, Param, BadRequestException } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.schema";
import { BoughtGift, SendedGift } from "src/gift/gift.schema";
import { USER_ID_REGEX } from "src/utils/userid.regex";
import { AuthUser } from "src/auth/auth.guard";
import { GetUser } from "src/auth/auth.decorator";

@Controller('users')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Get('me')
    async getMe(@GetUser() user: AuthUser){
        if (USER_ID_REGEX.test(user.id)) {
            throw new BadRequestException('User ID is invalid');
        }
        return this.usersService.findByIdOrCreate(user.id)
    }

    @Get('bought-gifts')
    async getUserBoughtGifts(@GetUser() user: AuthUser): Promise<BoughtGift[]> {
        if (USER_ID_REGEX.test(user.id)) {
            throw new BadRequestException('User ID is invalid');
        }

        return await this.usersService.getBoughtGifts(user.id);
    }

    @Get(':id')
    async getUser(@Param('id') id: string): Promise<User> {
        if (USER_ID_REGEX.test(id)) {
            throw new BadRequestException('User ID is invalid');
        }
        return this.usersService.findById(id);
    }

    @Get(':id/sended-gifts')
    async getUserSendedGifts(@Param('id') id: string): Promise<SendedGift[]> {
        if (USER_ID_REGEX.test(id)) {
            throw new BadRequestException('User ID is invalid');
        }

        return await this.usersService.getSendedGifts(id);
    }
}