import * as crypto from 'crypto';

export class Hasher {
    private readonly algorithm = 'aes-128-cbc';
    private readonly key: Buffer;
    private readonly iv: Buffer;

    constructor(secret: string) {
        this.key = crypto.scryptSync(secret, 'salt', 16);
        this.iv = crypto.scryptSync(secret, 'iv', 16);
    }

    encrypt(text: string): string {
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    decrypt(encryptedText: string): string {
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}