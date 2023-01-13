import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletModule } from './wallet/wallet.module';
import { constant } from './constant';

@Module({
  imports: [
    MongooseModule.forRoot(`${constant.MONGOURI}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
