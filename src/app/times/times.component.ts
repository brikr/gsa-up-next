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
          this.updateStatus();
        });

    interval(1000).subscribe(() => {
      this.updateStatus();
    });
  }

  // Updates the status map with new fromNow strings and status enums
  // The fromNow strings for events should look like the following:
  //  Past events: end of event .fromNow()
  //  Most recently ended event:
  //    If it has ended less than an hour ago (or has end date in the future):
  //      "Just finished"
  //    Otherwise: end of event.fromNow()
  //  Next event: "Up next"
  //  Other future events: start of event .fromNow()
  // Whether an event is in the past or future is based on the *middle* of the
  // event, not the start time. This allows us some room for early/late
  // intermissions.
  updateStatus() {
    let past = true;
    this.events.forEach((e, i) => {
      const middle = moment.unix((e.start.unix() + e.end.unix()) / 2);
      if (past) {
        if (middle.isBefore()) {
          this.eventStatus.set(e, {
            fromNow: e.end.fromNow(),
            status: past ? FromNowStatus.PAST : FromNowStatus.FUTURE,
          });
        } else {
          past = false;
          this.eventStatus.set(e, {
            fromNow: 'Up next',
            status: FromNowStatus.UP_NEXT,
          });
          if (i > 0 &&
              this.events[i - 1].end.isAfter(moment().subtract(1, 'hour'))) {
            this.eventStatus.set(this.events[i - 1], {
              fromNow: 'Just finished',
              status: FromNowStatus.PAST,
            });
          }
        }
      } else {
        this.eventStatus.set(e, {
          fromNow: e.start.fromNow(),
          status: past ? FromNowStatus.PAST : FromNowStatus.FUTURE,
        });
      }
    });
    // if all events are in the past, label the last as just finished
    // we don't have to worry about being within one hour here because this
    // screen will show until the stream is done for the day, which isn't very
    // long.
    if (past && this.events.length) {
      this.eventStatus.set(this.events[this.events.length - 1], {
        fromNow: 'Just finished',
        status: FromNowStatus.PAST,
      });
    }
  }
}