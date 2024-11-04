import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { BoughtGift, BoughtGiftSchema, SendedGift, SendedGiftSchema } from "src/gift/gift.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: BoughtGift.name, schema: BoughtGiftSchema },
            { name: SendedGift.name, schema: SendedGiftSchema }
        ])
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}