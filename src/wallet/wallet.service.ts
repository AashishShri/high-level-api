import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CardType, Wallet } from './interfaces/wallet.interface';
import { WalletDocument } from './schema/wallet.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel('Wallets') private readonly walletsModel: Model<Wallet>,
    @InjectModel('Transactions') private readonly transactionModel,
  ) {}

  async walletSetup(createWalletDto: CreateWalletDto): Promise<any> {
    const wallet = new this.walletsModel(createWalletDto);
    let walRes;
    let transaction;

    if (wallet._id) {
      const query = {
        walletId: wallet._id,
      };
      const accountUpdate = {
        amount: createWalletDto.balance,
        description: 'Setup',
        balance: createWalletDto.balance,
        type: 'CREDIT',
      };
      const opts = { upsert: true, useFindAndModify: false, new: true };
      transaction = await this.transactionModel
        .findOneAndUpdate(query, accountUpdate, opts)
        .lean();

      walRes = await wallet.save();
    }
    const finalResp = {
      id: walRes._id ? walRes._id : '',
      name: walRes.name ? walRes.name : '',
      balance: walRes.balance ? walRes.balance : '',
      transactionId: transaction._id ? transaction._id : '',
    };
    return finalResp;
  }

  // working without transaction
  async creditDebit(
    walletId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<any> {
    let transaction;
    const wallId = new mongoose.Types.ObjectId(walletId);
    const wallexist = await this.walletsModel.findById({ _id: wallId });

    // This block for credit the amount
    if (wallexist) {
      if (Math.sign(createTransactionDto?.amount) == 1) {
        console.log('going for credit');
        const Transaction = new this.transactionModel(createTransactionDto);
        console.log('Transaction', Transaction);
        const transactionUpdate = {
          amount: createTransactionDto.amount,
          description: createTransactionDto.description,
          balance: wallexist.balance + createTransactionDto.amount,
          type: CardType.CREDIT,
          walletId: wallId,
        };
        console.log('transactionUpdate', transactionUpdate);
        transaction = await this.transactionModel.create(transactionUpdate);
        console.log('transaction', transaction);
      } else if (
        Math.sign(createTransactionDto?.amount) == -1 &&
        wallexist.balance + createTransactionDto.amount >= 0
      ) {
        console.log('going for debit');
        const transactionUpdate = {
          amount: createTransactionDto.amount,
          description: createTransactionDto.description,
          balance: wallexist.balance + createTransactionDto.amount,
          type: CardType.DEBIT,
          walletId: wallId,
        };
        console.log('transactionUpdate', transactionUpdate);
        transaction = await this.transactionModel.create(transactionUpdate);
        console.log('transaction', transaction);
      } else {
        return {
          mesage: `You don't have sufficent amount ${wallexist.balance} `,
        };
      }

      await this.walletsModel.findByIdAndUpdate(
        {
          _id: wallId,
        },
        { balance: transaction.balance },
      );
    }

    const resp = {
      balance: transaction.balance,
      transactionId: transaction._id,
    };

    console.log('walletId', walletId);
    console.log('wallexist', wallexist);
    console.log('createTransactionDto', createTransactionDto);
    return resp;
  }

  async creditDebit1(
    walletId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log('session', session);

    try {
      let transaction;
      const wallId = new mongoose.Types.ObjectId(walletId);
      const wallexist = await this.walletsModel.findById({ _id: wallId });

      // This block for credit the amount
      if (wallexist) {
        if (Math.sign(createTransactionDto?.amount) == 1) {
          console.log('going for credit');
          const Transaction = new this.transactionModel(createTransactionDto);
          console.log('Transaction', Transaction);
          const transactionUpdate = {
            amount: createTransactionDto.amount,
            description: createTransactionDto.description,
            balance: wallexist.balance + createTransactionDto.amount,
            type: CardType.DEBIT,
            walletId: wallId,
          };
          console.log('transactionUpdate', transactionUpdate);
          transaction = await this.transactionModel.create(transactionUpdate);
          console.log('transaction', transaction);
        } else if (
          Math.sign(createTransactionDto?.amount) == -1 &&
          wallexist.balance + createTransactionDto.amount >= 0
        ) {
          console.log('going for debit');
          const transactionUpdate = {
            amount: createTransactionDto.amount,
            description: createTransactionDto.description,
            balance: wallexist.balance + createTransactionDto.amount,
            type: CardType.DEBIT,
            walletId: wallId,
          };
          console.log('transactionUpdate', transactionUpdate);
          transaction = await this.transactionModel.create(transactionUpdate);
          console.log('transaction', transaction);
        } else {
          return {
            mesage: `You don't have sufficent amount ${wallexist.balance} `,
          };
        }

        await this.walletsModel.findByIdAndUpdate(
          {
            _id: wallId,
          },
          { balance: transaction.balance },
        );
      }

      const resp = {
        balance: transaction.balance,
        transactionId: transaction._id,
      };

      console.log('walletId', walletId);
      console.log('wallexist', wallexist);
      console.log('createTransactionDto', createTransactionDto);
      await session.commitTransaction();
      return resp;
    } catch (error) {
      console.error('abort transaction');
      await session.abortTransaction();
    }
  }

  async listTransactions(data: any): Promise<any> {
    const page = data?.skip * 1 || 1;
    const limit = data.limit * 1 || 0;
    const skip = (page - 1) * limit;
    const transResp = await this.transactionModel
      .find(
        {
          walletId: new mongoose.Types.ObjectId(data.walletId),
        },
        { createdAt: 0, updatedAt: 0, __v: 0 },
      )
      .sort({ date: -1 })
      // .sort({ amount: 1, date: 1 }) // --- 1 for asc and -1 for desc
      .skip(skip)
      .limit(limit);
    // .skip(data.skip ? data.skip : 0)
    // .limit(data.limit ? data.limit : 0);
    return transResp;
  }

  async walletDetails(id: string): Promise<any> {
    const walletResp = await this.walletsModel.findOne(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      { createdAt: 0, updatedAt: 0 },
    );
    return walletResp;
  }

  async walletDetailsWithTrans(id: string): Promise<any> {
    const walletResp = await this.walletsModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'transactions',
          localField: '_id',
          foreignField: 'walletId',
          as: 'Transactions',
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          Transactions: { createdAt: 0, updatedAt: 0, __v: 0 },
        },
      },
    ]);
    return walletResp;
  }
}
