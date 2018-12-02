import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CalendarService} from './calendar.service';
import {TimesComponent} from './times/times.component';

@NgModule({
  declarations: [
    AppComponent,
    TimesComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
  ],
  providers: [
    CalendarService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
