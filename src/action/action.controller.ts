import { Controller, Get, Param, NotFoundException, BadRequestException, InternalServerErrorException, Query } from "@nestjs/common";
import { PaginationQueryDto } from "./action.dto";
import { ActionService } from "./action.service";
import { USER_ID_REGEX } from "src/utils/userid.regex";
import { GetUser } from "src/auth/auth.decorator";
import { AuthUser } from "src/auth/auth.guard";

@Controller('actions')
export class ActionController {
    constructor(private readonly actionService: ActionService) {}

    @Get('user')
    async getUserActions(
        @GetUser() user: AuthUser,
        @Query() query: PaginationQueryDto
    ) {
        if (!USER_ID_REGEX.test(user.id)) {
            throw new BadRequestException('User ID is invalid');
        }

        const { items, total } = await this.actionService.getRecentActionsByUser(
            user.id,
            query.page,
            query.limit
        );

        return {
            items,
            total,
            page: query.page,
            limit: query.limit,
            pages: Math.ceil(total / query.limit)
        };
    }

    @Get('gift/:giftId')
    async getGiftActions(
        @Param('giftId') giftId: string,
        @Query() query: PaginationQueryDto
    ) {
        const { items, total } = await this.actionService.getRecentActionsByGift(
            giftId,
            query.page,
            query.limit
        );

        return {
            items,
            total,
            page: query.page,
            limit: query.limit,
            pages: Math.ceil(total / query.limit)
        };
    }
}
