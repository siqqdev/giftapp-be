import { Injectable, Inject } from "@nestjs/common";
import { Hasher } from "./hasher";

@Injectable()
export class HasherService {
    private hasher: Hasher;

    constructor() {
        this.hasher = new Hasher(process.env.TELEGRAM_BOT_TOKEN);
    }

    encrypt(text: string): string {
        return this.hasher.encrypt(text);
    }

    decrypt(text: string): string {
        return this.hasher.decrypt(text);
    }
}