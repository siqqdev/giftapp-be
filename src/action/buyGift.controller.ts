import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { BuyGiftDto } from "./action.dto";
import { BuyGiftService } from "./buyGift.service";

@Controller('buy')
export class BuyGiftController {
    constructor(private readonly buyGiftService: BuyGiftService) { }

    @Post()
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