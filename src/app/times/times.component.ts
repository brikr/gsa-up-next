import {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import * as moment from 'moment';
import {interval} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {CalendarEvent, CalendarService} from '../calendar.service';

@Component({
  selector: 'gsa-times',
  templateUrl: 'times.component.html',
  styleUrls: ['times.component.scss'],
})
export class TimesComponent implements OnInit {
  events: CalendarEvent[] = [];
  fromNow: Map<CalendarEvent, string> = new Map();

  constructor(
      private readonly route: ActivatedRoute,
      private readonly calendarService: CalendarService,
  ) {}

  ngOnInit() {
    this.route.paramMap
        .pipe(switchMap(
            (params: ParamMap) =>
                this.calendarService.getTodayEvents(params.get('apiKey'))))
        .subscribe(res => {
          this.events = res;
        })

    interval(1000).subscribe(() => {this.events.forEach(e => {
                               this.fromNow.set(e, moment(e.start).fromNow());
                             })});
  }
}