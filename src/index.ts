import { Mailer } from './mail';
import { HourlyForecast, WeatherService, AemetWeatherService } from './weather-service';

if (process.env.WA_MAILGUN_API_KEY === undefined) {
    throw 'WA_MAILGUN_API_KEY was not defined.';
}

if (process.env.WA_MAILGUN_DOMAIN === undefined) {
    throw 'WA_MAILGUN_DOMAIN was not defined.';
}

const FORECAST_HORIZON_HOURS = process.env.WA_FORECAST_HORIZON_HOURS || 12;
const WIND_GUST_THRESHOLD_KMH = process.env.WA_WIND_GUST_THRESHOLD_KMH || 25;
const RECIPIENT_EMAIL = process.env.WA_RECIPIENT_EMAIL;
const MAILGUN_API_KEY = process.env.WA_MAILGUN_API_KEY;
const MAILGUN_API_URL = process.env.WA_MAILGUN_API_URL || 'https://api.mailgun.net';
const MAILGUN_DOMAIN = process.env.WA_MAILGUN_DOMAIN;

const run = async () => {
    let now = new Date();
    let weatherSvc: WeatherService = new AemetWeatherService();
    let mailer = new Mailer(MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_API_URL);
    // Fetch hourlies from weather service.
    let hourlies = (await weatherSvc.getHourlyForecasts())
        // Filter out potential hourlies corresponding to a time in the past.
        .filter((hourly: HourlyForecast) => {
            return hourly.datetime > now;
        })
        // Keep only those for specified time horizon.
        .slice(0, FORECAST_HORIZON_HOURS)
        // Keep only those exceeding the configured wind gust threshold.
        .filter((hourly: HourlyForecast) => {
            return hourly.maxGust > WIND_GUST_THRESHOLD_KMH;
        });

    if (RECIPIENT_EMAIL === undefined) {
        console.log('No email will be sent since a recipient email was not provided.');
    } else if (hourlies.length) {
        mailer.sendAlertEmail(hourlies, RECIPIENT_EMAIL);
        console.info('Alert email has been sent.');
    } else {
        console.info('No hourlies exceed threshold. No email will be sent.');
    }
};
run();
