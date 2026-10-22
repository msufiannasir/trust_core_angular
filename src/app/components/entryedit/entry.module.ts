import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NbCardModule, NbButtonModule } from '@nebular/theme';
import { EditEntryComponent } from './entry.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    EditEntryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NbCardModule,
    NbButtonModule,
    SharedModule
  ],
  exports: [
    EditEntryComponent
  ]
})
export class EntryModule { } 