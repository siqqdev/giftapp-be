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
        // Make base64 URL-safe by replacing non-URL-safe characters
        return this.makeBase64UrlSafe(encrypted);
    }

    decrypt(encryptedText: string): string {
        // Restore original base64 before decryption
        const originalBase64 = this.restoreBase64FromUrl(encryptedText);
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
        let decrypted = decipher.update(originalBase64, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    private makeBase64UrlSafe(base64: string): string {
        return base64
            .replace(/\+/g, '-')  // Convert + to -
            .replace(/\//g, '_')  // Convert / to _
            .replace(/=+$/, '');  // Remove ending =
    }

    private restoreBase64FromUrl(urlSafe: string): string {
        // Add back padding = characters
        let base64 = urlSafe
            .replace(/-/g, '+')  // Convert - back to +
            .replace(/_/g, '/'); // Convert _ back to /
        
        // Add back padding
        const pad = base64.length % 4;
        if (pad) {
            base64 += '='.repeat(4 - pad);
        }
        
        return base64;
    }
}