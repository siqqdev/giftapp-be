import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { GiftModule } from './gift/gift.module';
import { ActionModule } from './action/action.module';
import { BotService } from './telegram/bot.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { BotModule } from './telegram/bot.module';
import { HasherModule } from './hash/hasher.module';
import { TransferGiftModule } from './transfer/transferGift.module';
import { BuyGiftModule } from './buy/buyGift.module';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      MongooseModule.forRoot(process.env.MONGO_CONNECTION),
      HasherModule,
      UserModule,
      GiftModule,
      ActionModule,
      BotModule,
      BuyGiftModule,
      TransferGiftModule
  ],
  controllers: [AppController],
  providers: [
      AppService,
      {
          provide: APP_GUARD,
          useClass: AuthGuard,
      },
      Reflector
  ]
})
export class AppModule {}