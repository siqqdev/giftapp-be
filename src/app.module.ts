import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { User } from './user/user.schema';
import { UserModule } from './user/user.module';
import { GiftModule } from './gift/gift.module';
import { ActionModule } from './action/action.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_CONNECTION),
    UserModule,
    GiftModule,
    ActionModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
