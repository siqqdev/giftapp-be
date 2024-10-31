import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Action, ActionSchema, BuyAction, BuyActionSchema, TransferAction, TransferActionSchema } from "./action.schema";
import { GiftActionController } from "./giftAction.controller";
import { BuyGiftService } from "./buyGift.service";
import { Gift, GiftSchema, BoughtGift, BoughtGiftSchema } from "src/gift/gift.schema";
import { User, UserSchema } from "src/user/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Action.name,
                schema: ActionSchema,
                discriminators: [
                    { name: BuyAction.name, schema: BuyActionSchema },
                    { name: TransferAction.name, schema: TransferActionSchema}
                ]
            },
            { name: Gift.name, schema: GiftSchema },
            { name: User.name, schema: UserSchema },
            { name: BoughtGift.name, schema: BoughtGiftSchema }
        ])
    ],
    controllers: [
        GiftActionController
    ],
    providers: [
        BuyGiftService
    ]
})
export class ActionModule {}