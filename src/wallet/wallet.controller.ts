import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { transactionDTO } from './interfaces/wallet.interface';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/setup')
  create(@Body() createWalletDto: CreateWalletDto) {
    console.log('contoller called for initial setup wallet', createWalletDto);
    return this.walletService.walletSetup(createWalletDto);
  }

  @Post('/transact/:walletId')
  creditDebit(
    @Param('walletId') walletId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    console.log('contoller called for creditDebit', createTransactionDto);
    return this.walletService.creditDebit(walletId, createTransactionDto);
  }

  @Get('/transactions?')
  listTransactions(@Query() data: transactionDTO) {
    console.log('contoller called for listTransactions', data);
    return this.walletService.listTransactions(data);
  }

  @Get('/wallet/:id')
  walletDetails(@Param('id') id: string) {
    console.log('contoller called for walletDetails', id);
    return this.walletService.walletDetails(id);
  }

  @Get('/walletDetailsWithTrans/:id')
  walletDetailsWithTrans(@Param('id') id: string) {
    console.log('contoller called for walletDetailsWithTrans', id);
    return this.walletService.walletDetailsWithTrans(id);
  }
}
