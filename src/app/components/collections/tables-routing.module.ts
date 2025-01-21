import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TablesComponent } from './tables.component';
import { CollectionTableComponent } from './collection-table/collection-table.component';
import { UsersComponent } from '../users/users.component';
import { RolesComponent } from '../roles/roles.component';
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablesRoutingModule { }

export const routedComponents = [
  TablesComponent,
  CollectionTableComponent,
  UsersComponent,
  RolesComponent
  // SmartTableComponent,
  // TreeGridComponent,
];
