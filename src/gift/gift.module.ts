import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BoughtGift, BoughtGiftSchema, Gift, GiftSchema, SendedGift, SendedGiftSchema } from "./gift.schema";

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
    ]
})
export class GiftModule { }