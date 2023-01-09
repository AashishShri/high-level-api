import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import _ = require('lodash');
import { CardType, Wallet } from '../interfaces/wallet.interface';

export type TransactionsDocument = Transactions & Document;

@Schema({ timestamps: true, _id: true, versionKey: false })
export class Transactions {
  // @Prop({ type: String, required: true, unique: true, index: true })
  // id: string;

  @Prop({ required: true })
  amount: number;

  @Prop()
  description: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop()
  balance: number;

  @Prop({
    enum: _.values(CardType),
  })
  type: CardType;

  @Prop({ type: Types.ObjectId, ref: 'Wallet' })
  walletId: Wallet | Types.ObjectId;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
