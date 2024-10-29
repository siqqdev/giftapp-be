import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop()
    id: number;

    @Prop()
    name: string;

    @Prop()
    telegram_id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);