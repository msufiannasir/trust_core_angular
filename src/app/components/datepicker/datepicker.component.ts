import { Component } from '@angular/core';
import { NbDateService } from '@nebular/theme';
import { NgModule } from '@angular/core';
import { NbCardModule } from '@nebular/theme';

@Component({
  selector: 'ngx-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
})
@NgModule({
  imports: [
    NbCardModule,
  ],

})
export class DatepickerComponent {

  min: Date;
  max: Date;

  constructor(protected dateService: NbDateService<Date>) {
    this.min = this.dateService.addDay(this.dateService.today(), -5);
    this.max = this.dateService.addDay(this.dateService.today(), 5);
  }
}
