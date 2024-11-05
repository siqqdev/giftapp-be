import { Module } from "@nestjs/common";
import { BuyGiftController } from "./buyGift.controller";
import { BuyGiftService } from "./buyGift.service";
import { GiftModule } from "src/gift/gift.module";
import { UserModule } from "src/user/user.module";
import { ActionModule } from "src/action/action.module";
import { BotModule } from "src/telegram/bot.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Action } from "rxjs/internal/scheduler/Action";
import { ActionSchema } from "src/action/action.schema";
import { Gift, GiftSchema, BoughtGift, BoughtGiftSchema } from "src/gift/gift.schema";
import { User, UserSchema } from "src/user/user.schema";
import { CryptoPayService } from "./cryptopay/cryptopay.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Action.name, schema: ActionSchema },
            { name: Gift.name, schema: GiftSchema },
            { name: User.name, schema: UserSchema },
            { name: BoughtGift.name, schema: BoughtGiftSchema }
        ]),
        GiftModule,
        UserModule,
        ActionModule,
        BotModule
    ],
    controllers: [BuyGiftController],
    providers: [BuyGiftService, CryptoPayService],
    exports: [BuyGiftService]
})
export class BuyGiftModule {}