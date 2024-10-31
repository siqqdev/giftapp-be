import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { BuyGiftDto } from "./action.dto";
import { BuyGiftService } from "./buyGift.service";

@Controller('giftaction')
export class GiftActionController {
    constructor(private readonly buyGiftService: BuyGiftService) {}

    @Post('buy')
    async buyGift(@Body() buyGiftDto: BuyGiftDto) {
        if (!buyGiftDto || Object.keys(buyGiftDto).length === 0) {
            throw new BadRequestException('Invalid input');
        }

        return this.buyGiftService.buyGift(
            buyGiftDto.userId,
            buyGiftDto.giftId
        );
    }
}