import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Transactions } from './transaction.schema';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: false, _id: true, versionKey: false })
export class Wallet {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  balance: number;

  @Prop()
  date: Date;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Transactions' }],
  })
  Transactions?: Transactions[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
