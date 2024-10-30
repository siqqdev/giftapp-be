import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Action, ActionSchema, BuyAction, BuyActionSchema, TransferAction, TransferActionSchema } from "./action.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Action.name,
                schema: ActionSchema,
                discriminators: [
                    { name: BuyAction.name, schema: BuyActionSchema },
                    { name: TransferAction.name, schema: TransferActionSchema}
                ]
            }
        ])
    ]
})
export class ActionModule {}