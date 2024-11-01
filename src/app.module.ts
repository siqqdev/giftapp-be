import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { GiftModule } from './gift/gift.module';
import { ActionModule } from './action/action.module';
import { BotService } from './telegram/bot.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    UserModule,
    GiftModule,
    ActionModule
  ],
  controllers: [AppController],
  providers: [AppService, BotService]
})
export class AppModule {}
