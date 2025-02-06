import { NgModule } from '@angular/core';
import { NbCardModule, NbIconModule, NbInputModule, NbTreeGridModule ,NbLayoutModule, NbSelectModule } from '@nebular/theme';
import { Ng2SmartTableModule } from 'ng2-smart-table';

import { ThemeModule } from '../../@theme/theme.module';
import { TablesRoutingModule, routedComponents } from './tables-routing.module';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
// import { FsIconComponent } from './tree-grid/tree-grid.component';

@NgModule({
  imports: [
    NbCardModule,
    NbTreeGridModule,
    NbIconModule,
    NbInputModule,
    ThemeModule,
    TablesRoutingModule,
    Ng2SmartTableModule,
    NbLayoutModule,
    NbSelectModule,
    FormsModule , 
    ReactiveFormsModule
  ],
  declarations: [
    ...routedComponents,
    // FsIconComponent,
  ],
})
export class TablesModule { }
