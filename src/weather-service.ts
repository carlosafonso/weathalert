import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export class HourlyForecast {
    datetime: Date;
    maxGust: number;

    constructor(datetime: Date, maxGust: number) {
        this.datetime = datetime;
        this.maxGust = maxGust;
    }
}

export interface WeatherService {
    getHourlyForecasts(): Promise<HourlyForecast[]>;
}

export class AemetWeatherService implements WeatherService {
    constructor() {

    }
    async getHourlyForecasts(): Promise<HourlyForecast[]> {
        const forecastPayload = (await axios.get('https://www.aemet.es/xml/municipios_h/localidad_h_28113.xml')).data;
        const parser = new XMLParser({ ignoreAttributes: false });
        let hourlies = parser.parse(forecastPayload)
            .root
            .prediccion
            .dia
            // Data comes aggregated on a daily basis. Produce HourlyForecasts
            // for each day.
            .map((dayData: any) => {
                console.log(`Iterating on ${dayData['@_fecha']}`);
                const dayHourlies = [...Array(24).keys()]
                    // Produce an HourlyForecast for each hourly data point.
                    .map((v: number) => {
                        let hour = v.toString().padStart(2, '0');
                        let date = new Date(`${dayData['@_fecha']}T${hour}:00:00+02:00`);
                        let maxGust = dayData.racha_max.find((el: any) => el['@_periodo'] === hour);
                        if (maxGust !== undefined) {
                            maxGust = maxGust['#text'];
                        }
                        return new HourlyForecast(date, maxGust);
                    })
                    // Skip those that have no data.
                    .filter((v: HourlyForecast) => v.maxGust !== undefined);

                return dayHourlies;
            })
            // Flatten each day's hourlies into a single array.
            .flat();

        return hourlies;
    }
}

export class DummyWeatherService implements WeatherService {
    getHourlyForecasts(): Promise<HourlyForecast[]> {
        return Promise.resolve([
            new HourlyForecast(new Date('2023-08-01T00:00:00Z'), 25),
            new HourlyForecast(new Date('2023-08-01T01:00:00Z'), 14),
            new HourlyForecast(new Date('2023-08-01T02:00:00Z'), 34),
        ]);
    }
}
