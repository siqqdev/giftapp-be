import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BoughtGift, BoughtGiftSchema, Gift, GiftSchema, SendedGift, SendedGiftSchema } from "./gift.schema";
import { GiftController } from "./gift.controller";
import { GiftService } from "./gift.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Gift.name,
                schema: GiftSchema
            },
            {
                name: BoughtGift.name,
                schema: BoughtGiftSchema,
            },
            {
                name: SendedGift.name,
                schema: SendedGiftSchema
            }
        ])
    ],
    controllers: [
        GiftController
    ],
    providers: [
        GiftService
    ]
})
export class GiftModule { }