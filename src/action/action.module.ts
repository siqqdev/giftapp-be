import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Action, ActionSchema, BuyAction, BuyActionSchema, TransferAction, TransferActionSchema } from "./action.schema";
import { ActionController } from "./action.controller";
import { ActionService } from "./action.service";
import { UserModule } from "src/user/user.module";
import { User, UserSchema } from "src/user/user.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Action.name,
                schema: ActionSchema,
                discriminators: [
                    { name: BuyAction.name, schema: BuyActionSchema },
                    { name: TransferAction.name, schema: TransferActionSchema }
                ]
            }
        ]),
        UserModule
    ],
    controllers: [ActionController],
    providers: [ActionService],
    exports: [
        ActionService,
        MongooseModule 
    ]
})
export class ActionModule {}