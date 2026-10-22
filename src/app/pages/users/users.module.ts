import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from '../../components/users/users.component';
import { FilterPipe } from '../../pipes/filter.pipe';

@NgModule({
  declarations: [
    UsersComponent,
    FilterPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [UsersComponent]
})
export class UsersModule { } 