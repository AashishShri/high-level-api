import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum CardType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export class Wallet {
  @IsString()
  @ApiPropertyOptional({ required: true, default: '' })
  name: string;

  @IsString()
  @ApiProperty({ required: true })
  balance: number;

  @ApiPropertyOptional({ default: new Date().toLocaleDateString() })
  date: Date;
}

export class Transactions {
  transactionId: string;

  @IsString()
  @ApiProperty({ required: true })
  amount: number;

  @IsString()
  @ApiProperty({ required: true })
  description: string;

  balance: number;
  date: Date;
  type: CardType;
  walletId: string;
}

export class transactionDTO {
  @IsOptional()
  @ApiProperty()
  walletId: string;

  @IsOptional()
  @ApiPropertyOptional()
  skip: string;

  @IsOptional()
  @ApiPropertyOptional()
  limit: string;
}
