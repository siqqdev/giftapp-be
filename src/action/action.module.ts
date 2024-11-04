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
            },
            { name: Gift.name, schema: GiftSchema },
            { name: User.name, schema: UserSchema },
            { name: BoughtGift.name, schema: BoughtGiftSchema },
            { name: SendedGift.name, schema: SendedGiftSchema }
        ])
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
    ]
})
export class ActionModule { }