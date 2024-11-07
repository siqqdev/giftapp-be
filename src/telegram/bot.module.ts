import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { ActionModule } from "src/action/action.module";
import { HasherModule } from "src/hash/hasher.module";
import { BotController } from "./bot.controller";
import { CacheService } from "src/cache/cache.service";
import { UserModule } from "src/user/user.module";

@Module({
    imports: [
        ActionModule,
        HasherModule,
        UserModule
    ],
    controllers: [BotController],
    providers: [BotService, CacheService],
    exports: [BotService]
})
export class BotModule {}