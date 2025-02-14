import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NbThemeModule, NbLayoutModule, NbSelectModule, NbCardModule } from '@nebular/theme';
import { TablesComponent } from './tables.component';
import { CollectionTableComponent } from './collection-table/collection-table.component';
import { UsersComponent } from '../users/users.component';
import { RolesComponent } from '../roles/roles.component';
import { EditEntry } from '../entryedit/entry.component';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { SitesettingsComponent } from '../sitesettings/sitesettings.component';
import { CollectionListingComponent } from '../collections/collection-listing/collection-listing.component';
import { UsersettingsComponent } from '../usersettings/usersettings.component';

// import { SmartTableComponent } from './smart-table/smart-table.component';
// import { TreeGridComponent } from './tree-grid/tree-grid.component';

const routes: Routes = [{
  path: '',
  component: TablesComponent,
  children: [
    {
      path: 'collection-table',
      component: CollectionTableComponent,
    },
    // {
    //   path: 'tree-grid',
    //   component: TreeGridComponent,
    // },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes) , FormsModule , ReactiveFormsModule,NbLayoutModule,NbSelectModule,NbCardModule,],
  exports: [RouterModule],
})
export class TablesRoutingModule { }

export const routedComponents = [
  TablesComponent,
  CollectionTableComponent,
  UsersComponent,
  EditEntry,
  CollectionListingComponent,
  UsersettingsComponent,
  SitesettingsComponent,
  RolesComponent
  // SmartTableComponent,
  // TreeGridComponent,
];
