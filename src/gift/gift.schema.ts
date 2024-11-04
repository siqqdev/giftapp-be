import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class Gift {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    price: string;

    @Prop({ enum: ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX', 'USDC', 'JET'], required: true })
    asset: string;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ default: 0 })
    soldAmount: number;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);

@Schema()
export class BoughtGift {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    purchaseDate: Date;
    
    @Prop({ type: String, ref: 'User', required: true })
    user: String;

    @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
    gift: Types.ObjectId;
}

export const BoughtGiftSchema = SchemaFactory.createForClass(BoughtGift);

export class SendedGift {
    @Prop({ required: true })
    name: string;
    
    @Prop({ required: true })
    sendedDate: Date;
    
    @Prop({ required: true })
    totalAmount: number;
    
    @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
    gift: Types.ObjectId;

    @Prop({ required: true })
    owner: string;

    @Prop({ required: true })
    sendedBy: string;
}

export const SendedGiftSchema = SchemaFactory.createForClass(SendedGift);