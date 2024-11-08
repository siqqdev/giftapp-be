export interface TelegramConfig {
  botToken: string;
  webAppUrl: string;
  botUrl: string;
  assetsUrl: string;
}

export class TelegramConfigError extends Error {
  constructor(missingVars: string[]) {
    super(`Missing required environment variables: ${missingVars.join(', ')}`);
    this.name = 'TelegramConfigError';
  }
}

export class TelegramConfigValidator {
  static validate(): void {
    const requiredVars = [
      'TELEGRAM_BOT_TOKEN',
      'WEB_APP_URL',
      'TELEGRAM_BOT_URL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new TelegramConfigError(missingVars);
    }
  }
}

export const createTelegramConfig = (): TelegramConfig => {
  TelegramConfigValidator.validate();
  
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    webAppUrl: process.env.WEB_APP_URL!,
    botUrl: process.env.TELEGRAM_BOT_URL!,
    assetsUrl: `${process.env.WEB_APP_URL}/assets/logo-lgEQMm03.png`
  };
}