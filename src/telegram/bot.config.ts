export interface TelegramConfig {
  botToken: string;
  webAppUrl: string;
  botUrl: string;
  assetsUrl: string;
}

export const createTelegramConfig = (): TelegramConfig => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  webAppUrl: process.env.WEB_APP_URL,
  botUrl: process.env.TELEGRAM_BOT_URL,
  assetsUrl: `${process.env.WEB_APP_URL}/assets/logo-lgEQMm03.png`
});