import { Module } from "@nestjs/common";
import { TransferGiftController } from "./transferGift.controller";
import { TransferGiftService } from "./transferGift.service";
import { UserModule } from "src/user/user.module";
import { GiftModule } from "src/gift/gift.module";
import { ActionModule } from "src/action/action.module";
import { BotModule } from "src/telegram/bot.module";
import { HasherModule } from "src/hash/hasher.module";

@Module({
    imports: [
        ActionModule,
        UserModule,
        GiftModule,
        BotModule,
        HasherModule
    ],
    controllers: [TransferGiftController],
    providers: [TransferGiftService],
    exports: [TransferGiftService]
})
export class TransferGiftModule {}