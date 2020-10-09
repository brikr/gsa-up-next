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
  FUTURE,
}

interface EventStatus {
  fromNow: string;
  status: FromNowStatus;
}

// Maximum number of events to show on the page. This should be an odd number so
// centering is easy. The "Up next" event will be as centered as possible in the
// shown list e.g. if max is 7, there will be 3 events before and 3 after shown
const MAX_EVENTS_LENGTH = 7;

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

  constructor(private readonly route: ActivatedRoute, private readonly calendarService: CalendarService) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.calendarService.getTodayEvents(params.get('apiKey')!)))
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
    let past = true; // Whether we are currently iterating past an event that
    // is in the past
    let preCount = 0; // Number of events before the "Up next" event
    let postCount = 0; // Number of events after the "Up next" event
    this.events.forEach((e, i) => {
      const middle = moment.unix((e.start.unix() + e.end.unix()) / 2);
      if (past) {
        if (middle.isBefore()) {
          this.eventStatus.set(e, {
            fromNow: e.end.fromNow(),
            status: FromNowStatus.PAST,
          });
          preCount++;
        } else {
          past = false;
          this.eventStatus.set(e, {
            fromNow: 'Up next',
            status: FromNowStatus.UP_NEXT,
          });
          if (i > 0 && this.events[i - 1].end.isAfter(moment().subtract(1, 'hour'))) {
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
        postCount++;
      }
    });
    // if all events are in the past, label the last as just finished
    // we don't have to worry about being within one hour here because this
    // screen will show until the stream is done for the day, which isn't very
    // long.
    if (past && this.events.length > 0) {
      this.eventStatus.set(this.events[this.events.length - 1], {
        fromNow: 'Just finished',
        status: FromNowStatus.PAST,
      });

      // Trim events. If all events are in the past, we just want the last
      // MAX_EVENTS_LENGTH events
      if (this.events.length > MAX_EVENTS_LENGTH) {
        const frontTrim = this.events.length - MAX_EVENTS_LENGTH;
        this.events = this.events.splice(frontTrim);
      }
    } else {
      // Trim events. There are four cases we need to account for

      if (this.events.length <= MAX_EVENTS_LENGTH) {
        // 1. Total length is less than or equal to max. No trimming required
        return;
      }

      const halfMax = (MAX_EVENTS_LENGTH - 1) / 2; // e.g. 7 -> 3
      if (preCount <= halfMax && postCount > halfMax) {
        // 2. preCount less than or equal to half, and postCount greater than
        // half. Trim off the end

        // Trim such that preCount + postCount = halfMax * 2
        const backTrim = postCount - halfMax - (halfMax - preCount);
        this.events = this.events.slice(0, this.events.length - backTrim);
      } else if (preCount > halfMax && postCount <= halfMax) {
        // 3. preCount greater than half, and postCount less than or equal to
        // half. Trim off beginning

        // Trim such that preCount + postCount = halfMax * 2
        const frontTrim = preCount - halfMax - (halfMax - postCount);
        this.events = this.events.slice(frontTrim, this.events.length);
      } else if (preCount > halfMax && postCount > halfMax) {
        // 4. Both are greater than half. Trim off both ends

        // Trim both down to halfMax
        const frontTrim = preCount - halfMax;
        const backTrim = postCount - halfMax;
        this.events = this.events.slice(frontTrim, this.events.length - backTrim);
      }
    }
  }
}
