import {NgClass} from '@angular/common';
import {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import * as moment from 'moment';
import {interval} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {CalendarEvent, CalendarService} from '../calendar.service';

enum FromNowStatus {
  PAST,
  UP_NEXT,
  FUTURE
}

interface EventStatus {
  fromNow: string;
  status: FromNowStatus;
}

@Component({
  selector: 'gsa-times',
  templateUrl: 'times.component.html',
  styleUrls: ['times.component.scss'],
})
export class TimesComponent implements OnInit {
  events: CalendarEvent[] = [];
  eventStatus: Map<CalendarEvent, EventStatus> = new Map();

  // put enum in template scope
  FromNowStatus = FromNowStatus;

  constructor(
      private readonly route: ActivatedRoute,
      private readonly calendarService: CalendarService,
  ) {}

  ngOnInit() {
    this.route.paramMap
        .pipe(switchMap(
            (params: ParamMap) =>
                this.calendarService.getTodayEvents(params.get('apiKey')!)))
        .subscribe(res => {
          this.events = res;
          this.updateFromNow();
        });

    interval(1000).subscribe(() => {
      this.updateFromNow();
    });
  }

  updateFromNow() {
    let past = true;
    this.events.forEach(e => {
      const middle = moment.unix((e.start.unix() + e.end.unix()) / 2);
      if (past && middle.isAfter()) {
        // set the first future event to "Up next". Base this off the middle
        // of each event so we don't see oddities with slightly early or late
        // intermissions.
        past = false;
        this.eventStatus.set(e, {
          fromNow: 'Up next',
          status: FromNowStatus.UP_NEXT,
        });
      } else {
        this.eventStatus.set(e, {
          fromNow: e.start.fromNow(),
          status: past ? FromNowStatus.PAST : FromNowStatus.FUTURE,
        });
      }
    });
  }
}