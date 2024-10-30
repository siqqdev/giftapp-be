import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

// @Schema()
// export class Action extends Document {
//   @Prop({ required: true, enum: ['buy', 'transfer'] })
//   type: string;

//   @Prop({ type: Types.ObjectId, ref: 'User', required: true })
//   user: Types.ObjectId;

//   @Prop({ type: Types.ObjectId, ref: 'User' })
//   toUser?: Types.ObjectId;

//   @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
//   gift: Types.ObjectId;

//   @Prop()
//   amount?: string

//   @Prop({ enum: ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX', 'USDC', 'JET'] })
//   asset?: string;

//   @Prop({ required: true })
//   date: Date;

//   @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending', required: true })
//   status: string;
// }

// export const ActionSchema = SchemaFactory.createForClass(Action);

@Schema({ discriminatorKey: 'type' })
export class Action {
  @Prop({ required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
  gift: Types.ObjectId;

  // TODO gift id of user bought gift

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending', required: true })
  status: string;
}

export const ActionSchema = SchemaFactory.createForClass(Action);

@Schema()
export class BuyAction extends Action {
  @Prop({ required: true })
  amount: string;

  @Prop({ required: true, enum: ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX', 'USDC', 'JET'] })
  asset: string;
}

export const BuyActionSchema = SchemaFactory.createForClass(BuyAction);

@Schema()
export class TransferAction extends Action {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  toUser: Types.ObjectId;
}

export const TransferActionSchema = SchemaFactory.createForClass(TransferAction);