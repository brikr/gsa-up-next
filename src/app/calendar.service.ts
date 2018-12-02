import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export interface CalendarEvents {
  items: CalendarEvent[],
}

export interface CalendarEvent {
  summary: string, description: string, start: Moment, end: Moment,
}

@Injectable()
export class CalendarService {
  constructor(private httpClient: HttpClient) {}

  getTodayEvents(key: string, date?: Date): Observable<CalendarEvent[]> {
    if (!date) {
      date = new Date();
    }
    const tomorrow = new Date();
    tomorrow.setDate(date.getDate() + 1);
    if (date.getUTCHours() > 12) {
      date.setUTCHours(12, 0, 0);
      tomorrow.setUTCHours(12, 0, 0);
    } else {
      date.setUTCHours(-12, 0, 0);
      tomorrow.setUTCHours(-12, 0, 0);
    }
    return this.httpClient
        .get(
            'https://www.googleapis.com/calendar/v3/calendars/globalspeedrun@gmail.com/events',
            {
              params: {
                key: key,
                orderBy: 'startTime',
                singleEvents: 'true',
                timeMin: date.toISOString(),
                timeMax: tomorrow.toISOString(),
              }
            })
        .pipe(switchMap(
            (response: CalendarEvents) => of(response.items.map((item: any) => {
              return {
                summary: item.summary, description: item.description,
                    start: moment(item.start.dateTime),
                    end: moment(item.end.dateTime),
              }
            }))));
  }
}