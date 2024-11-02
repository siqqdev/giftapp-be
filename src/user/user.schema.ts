import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    id: string;

    @Prop({ default: 0 })
    giftsReceived: number;

    @Prop({ default: () => new Date(), required: true })
    createdDate: Date;

    // @Prop({ type: [{ type: Types.ObjectId, ref: 'BoughtGift' }] })
    // boughtGifts: Types.ObjectId[];

    // @Prop({ type: [{ type: Types.ObjectId, ref: 'SendedGift' }] })
    // sendedGifts: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);