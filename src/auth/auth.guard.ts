import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { createHmac } from "crypto";

export interface AuthUser {
    id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    allows_write_to_pm?: boolean;
    chat_instance?: string;
    chat_type?: string;
    auth_date?: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly botToken: string;

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
        }
        this.botToken = token;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['auth'];

        if (!authHeader) {
            throw new UnauthorizedException('Auth header required');
        }

        try {
            // const user = await this.validateAuth(authHeader as string);
            const user = await this.fakeValidate(authHeader as string)

            request['user'] = user;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid authentication');
        }
    }

    private async fakeValidate(auth: string) {
        return {
            id: auth,
            first_name: 'roman'
        }
    }

    private async validateAuth(auth: string): Promise<AuthUser> {
        const params = new URLSearchParams(auth);
        const hash = params.get('hash');

        if (!hash) {
            throw new Error('Hash is required');
        }

        params.delete('hash');

        const sortedParams = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        const secretKey = createHmac('sha256', 'WebAppData')
            .update(this.botToken)
            .digest();

        const dataCheck = createHmac('sha256', secretKey)
            .update(sortedParams)
            .digest('hex');

        if (dataCheck !== hash) {
            throw new Error('Invalid hash');
        }

        const userData = JSON.parse(params.get('user') || '{}');

        return {
            ...userData,
            chat_instance: params.get('chat_instance') || undefined,
            chat_type: params.get('chat_type') || undefined,
            auth_date: params.get('auth_date') ? Number(params.get('auth_date')) : undefined
        };
    }
}