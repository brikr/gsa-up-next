import {OnInit} from '@angular/core';
import {Component} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {CalendarEvent, CalendarService} from '../calendar.service';

@Component({
  selector: 'gsa-times',
  templateUrl: 'times.component.html',
  styleUrls: ['times.component.scss'],
})
export class TimesComponent implements OnInit {
  events: Observable<CalendarEvent[]>;

  constructor(
      private readonly route: ActivatedRoute,
      private readonly calendarService: CalendarService,
  ) {}

  ngOnInit() {
    this.events = this.route.paramMap.pipe(switchMap(
        (params: ParamMap) =>
            this.calendarService.getTodayEvents(params.get('apiKey'))))
  }
}