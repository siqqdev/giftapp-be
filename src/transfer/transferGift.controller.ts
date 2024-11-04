import { Controller, Post, Body, BadRequestException, Param } from "@nestjs/common";
import { Types } from "mongoose";
import { TransferGiftService } from "./transferGift.service";
import { GetUser } from "src/auth/auth.decorator";
import { AuthUser } from "src/auth/auth.guard";
import { HasherService } from "src/hash/hasher.service";
import { InitTransferGiftDto, CompleteTransferGiftDto } from "./transferGift.dto";

@Controller('transfer')
export class TransferGiftController {
    constructor(
        private readonly transferGiftService: TransferGiftService,
        private readonly hasherSevice: HasherService) { }

    @Post()
    async initTransferGift(@Body() transferDto: InitTransferGiftDto, @GetUser() user: AuthUser) {
        const boughtGiftId = transferDto.boughtGiftId
        if (!Types.ObjectId.isValid(boughtGiftId)) {
            throw new BadRequestException('Invalid gift ID format');
        }

        const action = await this.transferGiftService.initializeGiftTransfer(boughtGiftId, user.id)

        const actionIdHash = this.hasherSevice.encrypt(action._id.toString())

        return {
            "hash": actionIdHash
        }
    }

    @Post('complete')
    async completeTransferGift(@Body() transferDto: CompleteTransferGiftDto, @GetUser() user: AuthUser){

        const transferActionId = this.hasherSevice.decrypt(transferDto.actionIdHash)

        if (!Types.ObjectId.isValid(transferActionId)) {
            throw new BadRequestException('Invalid ID format');
        }

        return await this.transferGiftService.completeGiftTransfer(new Types.ObjectId(transferActionId), user.id)
    }
}