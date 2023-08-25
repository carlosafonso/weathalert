import formData from 'form-data';
import Mailgun, { MailgunClientOptions, MessagesSendResult } from 'mailgun.js';
import { IMailgunClient } from 'mailgun.js/Interfaces';
import { HourlyForecast } from "./weather-service";

export class Mailer {
    protected client: IMailgunClient;

    constructor(
        protected mailgunApiKey: string,
        protected mailgunDomain: string,
        protected mailgunApiUrl: string
    ) {
        let mailgun = new Mailgun(formData);
        this.client = mailgun.client({
            username: 'api',
            key: mailgunApiKey,
            url: mailgunApiUrl,
        });
    }

    sendAlertEmail(hourlies: HourlyForecast[], recipientEmail: string): void {
        let hourliesAsText = hourlies.map((hourly: HourlyForecast): string => {
            return `Wind gusts of ${hourly.maxGust} at ${hourly.datetime}`;
        })
        .reduce((prev: string, cur: string): string => {
            return `${prev}\n${cur}`;
        }, `Alerts:`);
        const messageData = {
            from: `Weathalert System <no-reply@${this.mailgunDomain}>`,
            to: recipientEmail,
            subject: 'Warning: wind gust threshold will be breached in the next hours',
            text: hourliesAsText,
        };
        this.client.messages.create(this.mailgunDomain, messageData)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
