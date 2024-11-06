import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { ActionModule } from "src/action/action.module";
import { HasherModule } from "src/hash/hasher.module";
import { BotController } from "./bot.controller";
import { CacheService } from "src/cache/cache.service";

@Module({
    imports: [
        ActionModule,
        HasherModule
    ],
    controllers: [BotController],
    providers: [BotService, CacheService],
    exports: [BotService]
})
export class BotModule {}