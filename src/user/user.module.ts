import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { BoughtGift, BoughtGiftSchema, SendedGift, SendedGiftSchema } from "src/gift/gift.schema";
import { GiftModule } from "src/gift/gift.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            
        ]),
        GiftModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [
        UserService,
        MongooseModule 
    ]
})
export class UserModule {}