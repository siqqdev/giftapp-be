import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { ActionModule } from "src/action/action.module";
import { HasherModule } from "src/hash/hasher.module";

@Module({
    imports: [
        ActionModule,
        HasherModule
    ],
    providers: [BotService],
    exports: [BotService]
})
export class BotModule {}