import { Controller, Post, Body, BadRequestException, Param } from "@nestjs/common";
import { BuyGiftDto, InitTransferGiftDto } from "./action.dto";
import { BuyGiftService } from "./buyGift.service";
import { Model, Types } from "mongoose";
import { TransferGiftService } from "./transferGift.service";
import { GetUser } from "src/auth/auth.decorator";
import { AuthUser } from "src/auth/auth.guard";
import { InjectModel } from "@nestjs/mongoose";
import { SendedGift } from "src/gift/gift.schema";

@Controller('transfer')
export class TransferGiftController {
    constructor(private readonly transferGiftService: TransferGiftService) { }

    @Post()
    async initTransferGift(@Body() transferDto: InitTransferGiftDto, @GetUser() user: AuthUser) {
        const boughtGiftId = transferDto.boughtGiftId
        if (!Types.ObjectId.isValid(boughtGiftId)) {
            throw new BadRequestException('Invalid gift ID format');
        }

        return await this.transferGiftService.initializeGiftTransfer(boughtGiftId, user.id)
    }

    @Post('complete/:id')
    async completeTransferGift(@Param() transferActionId: string, @GetUser() user: AuthUser){
        if (!Types.ObjectId.isValid(transferActionId)) {
            throw new BadRequestException('Invalid ID format');
        }

        return await this.transferGiftService.completeGiftTransfer(new Types.ObjectId(transferActionId), user.id)
    }
}