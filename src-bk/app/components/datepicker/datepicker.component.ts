import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NbDateService } from '@nebular/theme';

@Component({
  selector: 'ngx-datepicker',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() min: Date; // Minimum date
  @Input() max: Date; // Maximum date
  @Input() value: any; // The initial value (if any)
  @Output() valueChange = new EventEmitter<any>(); // Emits the new value (file)

  dateValue: Date; // This will hold the current date value

  // ControlValueAccessor methods
  private onChange: (date: Date) => void;
  private onTouched: () => void;

  constructor(protected dateService: NbDateService<Date>) {
    // this.min = this.dateService.addDay(this.dateService.today(), -5);
    // this.max = this.dateService.addDay(this.dateService.today(), 5);
  }

  // Method to write value from the form control to the component
  writeValue(value: Date): void {
    this.dateValue = value; // Set the value from the form control
  }

  // Method to register the change function
  registerOnChange(fn: (date: Date) => void): void {
    this.onChange = fn; // Save the change function
  }

  // Method to register the touched function
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn; // Save the touched function
  }

  // Method to handle date changes
  onDateChange(event: Date) {
    this.dateValue = event; // Update the local value
    if (this.onChange) {
      this.valueChange.emit(this.dateValue); 
      this.onChange(event); // Call the change function
    }
    if (this.onTouched) {
      this.onTouched(); // Call the touched function
    }
  }
}