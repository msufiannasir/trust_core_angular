import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NbCardModule, NbButtonModule, NbInputModule, NbSelectModule } from '@nebular/theme';
import { EditUserComponent } from './edit-user.component';
import { EditUserRoutingModule } from './edit-user-routing.module';

@NgModule({
  declarations: [EditUserComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NbCardModule,
    NbButtonModule,
    NbInputModule,
    NbSelectModule,
    EditUserRoutingModule
  ]
})
export class EditUserModule { } 