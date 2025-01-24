import { Component,EventEmitter, Input, Output } from '@angular/core';
import { NbDateService } from '@nebular/theme';

@Component({
  selector: 'ngx-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
})
export class DatepickerComponent {

  min: Date;
  max: Date;
  @Input() dateValue: Date; // Input to receive the current date value
  @Output() dateChange = new EventEmitter<Date>(); // Output to emit the selected date
  constructor(protected dateService: NbDateService<Date>) {
    this.min = this.dateService.addDay(this.dateService.today(), -5);
    this.max = this.dateService.addDay(this.dateService.today(), 5);
  }
  onDateChange(event){
    const selectedDate = new Date(event.target.value);
    this.dateChange.emit(selectedDate);
    console.log(event.target.value,'onDateChange');

  }
}
