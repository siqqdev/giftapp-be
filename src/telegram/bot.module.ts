import { Module, OnModuleInit } from "@nestjs/common";
import { BotService } from "./bot.service";
import { ActionModule } from "src/action/action.module";
import { HasherModule } from "src/hash/hasher.module";
import { BotController } from "./bot.controller";
import { CacheService } from "src/cache/cache.service";
import { UserModule } from "src/user/user.module";
import { InlineQueryFactory } from "./bot.inline-query.factory";
import { TelegramKeyboardFactory } from "./bot.keyboard.factory";
import { TelegramConfigValidator } from "./bot.config";

@Module({
    imports: [
        ActionModule,
        HasherModule,
        UserModule
    ],
    controllers: [BotController],
    providers: [
        BotService,
        CacheService,
        TelegramKeyboardFactory,
        InlineQueryFactory
    ],
    exports: [BotService]
})
export class BotModule implements OnModuleInit {
  onModuleInit() {
    TelegramConfigValidator.validate();
  }
}