import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TimesComponent} from './times/times.component';

const routes: Routes = [
  {
    path: ':apiKey',
    component: TimesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
