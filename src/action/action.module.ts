import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Action, ActionSchema, BuyAction, BuyActionSchema, TransferAction, TransferActionSchema } from "./action.schema";
import { BuyGiftService } from "./buyGift.service";
import { Gift, GiftSchema, BoughtGift, BoughtGiftSchema, SendedGift, SendedGiftSchema } from "src/gift/gift.schema";
import { User, UserSchema } from "src/user/user.schema";
import { ActionController } from "./action.controller";
import { ActionService } from "./action.service";
import { TransferGiftService } from "./transferGift.service";
import { BuyGiftController } from "./buyGift.controller";
import { TransferGiftController } from "./transferGift.controller";
import { HasherService } from "src/hash/hasher.service";
import { GiftModule } from "src/gift/gift.module";
import { HasherModule } from "src/hash/hasher.module";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Action.name,
                schema: ActionSchema,
                discriminators: [
                    { name: BuyAction.name, schema: BuyActionSchema },
                    { name: TransferAction.name, schema: TransferActionSchema }
                ]
            }
        ]),
        GiftModule,
        UserModule, 
        HasherModule
    ],
    controllers: [
        BuyGiftController,
        TransferGiftController,
        ActionController
    ],
    providers: [
        BuyGiftService,
        ActionService,
        TransferGiftService
    ],
    exports: [ActionService, TransferGiftService, BuyGiftService]
})
export class ActionModule {}