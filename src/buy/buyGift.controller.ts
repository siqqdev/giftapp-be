import { Controller, Post, Body, BadRequestException, Param } from "@nestjs/common";
import { BuyGiftService } from "./buyGift.service";
import { BuyGiftDto } from "./buyGift.dto";
import { Types } from "mongoose";
import { GetUser } from "src/auth/auth.decorator";
import { AuthUser } from "src/auth/auth.guard";

@Controller('buy')
export class BuyGiftController {
    constructor(private readonly buyGiftService: BuyGiftService) { }

    @Post()
    async initPurchase(@Body() buyGiftDto: BuyGiftDto, @GetUser() user: AuthUser) {
        if (!buyGiftDto || Object.keys(buyGiftDto).length === 0) {
            throw new BadRequestException('Invalid input');
        }

        return this.buyGiftService.initPurchase(
            user.id,
            buyGiftDto.giftId
        );
    }

    @Post('complete/:actionId')
    async completePurchase(@Param('actionId') actionId: string) {
        if (!Types.ObjectId.isValid(actionId)) {
            throw new BadRequestException('Invalid action ID format');
        }

        return await this.buyGiftService.completePurchase(new Types.ObjectId(actionId));
    }

    @Post('check-pending')
    async checkPendingActions(){
        return await this.buyGiftService.checkPendingActions()
    }
}