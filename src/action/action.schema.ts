import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { AssetType } from "src/buy/cryptopay/cryptopay.models";

export enum ActionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Schema({ discriminatorKey: 'type' })
export class Action {
  @Prop({ required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
  gift: Types.ObjectId;

  @Prop({ type: String })
  giftName: string

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ActionStatus, default: ActionStatus.PENDING, required: true })
  status: string;
}

export const ActionSchema = SchemaFactory.createForClass(Action);

@Schema()
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceId: number;

  @Prop({ required: true })
  miniAppInvoiceUrl: string;

  @Prop({ required: true })
  botInvoiceUrl: string;
}

@Schema()
export class BuyAction {
  @Prop({ required: true })
  amount: string;

  @Prop({ required: true, enum: AssetType })
  asset: string;

  @Prop({ type: Invoice, required: true })
  invoice: Invoice;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
export const BuyActionSchema = SchemaFactory.createForClass(BuyAction);

@Schema()
export class TransferAction {
  @Prop({ required: false })
  toUser: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'BoughtGift', required: true })
  boughtGiftId: Types.ObjectId;
}

export const TransferActionSchema = SchemaFactory.createForClass(TransferAction);