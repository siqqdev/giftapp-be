import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

@Injectable()
export class CacheService {
    private readonly cache: Map<string, CacheEntry<any>>;

    constructor() {
        this.cache = new Map();
        setInterval(() => this.cleanExpiredCache(), 15 * 60 * 1000);
    }

    set<T>(key: string, data: T, ttlMs: number): void {
        this.cache.set(key, {
            data,
            expiresAt: Date.now() + ttlMs
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    private cleanExpiredCache(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }
}