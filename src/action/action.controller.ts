import { Controller, Get, Param, NotFoundException, BadRequestException, InternalServerErrorException, Query } from "@nestjs/common";
import { PaginationQueryDto } from "./action.dto";
import { ActionService } from "./action.service";

@Controller('actions')
export class ActionController {
    constructor(private readonly actionService: ActionService) {}

    @Get('user/:id')
    async getUserActions(
        @Param('id') userId: string,
        @Query() query: PaginationQueryDto
    ) {
        if (!/^\d+$/.test(userId)) {
            throw new BadRequestException('User ID is invalid');
        }

        const { items, total } = await this.actionService.getRecentActionsByUser(
            userId,
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
