import { createCipheriv, createDecipheriv } from "crypto";

export class GiftHasher {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key: Buffer;
    private readonly iv: Buffer;

    constructor(encryptionKey: string) {
        this.key = Buffer.from(encryptionKey.padEnd(32, '0').slice(0, 32));
        this.iv = Buffer.from(encryptionKey.padEnd(16, '0').slice(0, 16));
    }

    encodeGiftId(giftId: string): string {
        try {
            const cipher = createCipheriv(this.algorithm, this.key, this.iv);
            let encrypted = cipher.update(giftId, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            return this.makeUrlSafe(encrypted).slice(0, 12);
        } catch (error) {
            console.error('Encryption error:', error);
            return '';
        }
    }

    decodeGiftId(hash: string): string {
        try {
            const cleanHash = hash.startsWith('=') ? hash.slice(1) : hash;

            const paddedHash = this.restorePadding(cleanHash);

            const base64Hash = this.reverseUrlSafe(paddedHash);

            const decipher = createDecipheriv(this.algorithm, this.key, this.iv);
            let decrypted = decipher.update(base64Hash, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            return '';
        }
    }

    private makeUrlSafe(base64: string): string {
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private reverseUrlSafe(urlSafe: string): string {
        return urlSafe
            .replace(/-/g, '+')
            .replace(/_/g, '/');
    }

    private restorePadding(input: string): string {
        const pad = 4 - (input.length % 4);
        if (pad !== 4) {
            return input + '='.repeat(pad);
        }
        return input;
    }
}

const hasher = new GiftHasher(process.env.TELEGRAM_BOT_TOKEN);

export const createGiftHash = (giftId: string): string => {
    return hasher.encodeGiftId(giftId);
};

export const parseGiftHash = (hash: string): string => {
    return hasher.decodeGiftId(hash);
};