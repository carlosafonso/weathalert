export { };

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WA_FORECAST_HORIZON_HOURS?: number;
      WA_WIND_GUST_THRESHOLD_KMH?: number;
      WA_MAILGUN_API_KEY: string;
      WA_MAILGUN_DOMAIN: string;
      WA_MAILGUN_API_DOMAIN?: string;
      WA_RECIPIENT_EMAIL?: string;
    }
  }
}
