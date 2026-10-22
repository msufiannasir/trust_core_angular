import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ECommerceComponent } from './e-commerce/e-commerce.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { CollectionTableComponent } from '../components/collections/collection-table/collection-table.component';
import { CollectionListingComponent } from '../components/collections/collection-listing/collection-listing.component';
import { UsersComponent } from '../components/users/users.component';
import { RolesComponent } from '../components/roles/roles.component';
import { BlueprintComponent } from '../components/blueprint/blueprint.component';
import { EditEntryComponent } from '../components/entryedit/entry.component';
import { SitesettingsComponent } from '../components/sitesettings/sitesettings.component';
import { UsersettingsComponent } from '../components/usersettings/usersettings.component';
import { AuthGuard } from '../auth.guard';
import { CreateUserComponent } from '../../app/pages/users/create-user/create-user.component';
import { EditUserComponent } from '../../app/pages/users/edit-user/edit-user.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'dashboard',
      component: ECommerceComponent,
      canActivate: [AuthGuard],
      data: { permission: 'dashboard' } 
    },
    {
      path: 'collections/templates/all',
      component: CollectionListingComponent, // Only for ':handle' routes
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      canActivate: [AuthGuard],
      data: { permission: 'templates' } 
    },
    {
      path: 'collections/all',
      component: CollectionListingComponent, // Only for ':handle' routes
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      canActivate: [AuthGuard],
      data: { permission: 'collections' } 
    },

        // Static routes should come first
    {
      path: 'settings/site',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: SitesettingsComponent,
      canActivate: [AuthGuard],
      data: { permission: 'settings' } 
    },
    {
      path: 'settings/user',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: UsersettingsComponent,
      canActivate: [AuthGuard],
      data: { permission: 'settings' } 
    },
    {
      path: ':handle',
      component: CollectionTableComponent, // Only for ':handle' routes
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      canActivate: [AuthGuard],
      data: { permission: ':handle' } 

    },
    {
      path: ':handle/blueprint',
      loadChildren: () => import('../components/collections/tables.module')
      .then(m => m.TablesModule),
      component: BlueprintComponent, // Only for ':handle' routes
      canActivate: [AuthGuard],
      data: { permission: 'blueprints' } 

    },

    {
      path: ':handle/entry/:entryId',
      loadChildren: () => import('../components/collections/tables.module')
      .then(m => m.TablesModule),
      component: EditEntryComponent,
      canActivate: [AuthGuard],
      data: { permission: 'pagesEdit' } 

    },
    {
      path: ':handle/create',
      loadChildren: () => import('../components/collections/tables.module')
      .then(m => m.TablesModule),
      component: EditEntryComponent,
      canActivate: [AuthGuard],
      data: { permission: 'pagesCreate' } 

    },
    {
      path: ':handle/edit/:id',
      loadChildren: () => import('../components/collections/tables.module')
      .then(m => m.TablesModule),
      component: EditEntryComponent,
      canActivate: [AuthGuard],
      data: { permission: 'pagesEdit' } 

    },
  

    {
      path: 'customers',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: CollectionTableComponent,
      canActivate: [AuthGuard],
      data: { permission: 'users' } 


    },
    {
      path: 'reports',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: CollectionTableComponent,
      canActivate: [AuthGuard],
      data: { permission: 'reports' } 

    },
    {
      path: 'users/list',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: UsersComponent,
      canActivate: [AuthGuard],
      data: { permission: 'users' } 

    },
    {
      path: 'users/list/all',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: UsersComponent,
      canActivate: [AuthGuard],
      data: { permission: 'users' } 

    },
    {
      path: 'user/profile',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: UsersComponent,
      canActivate: [AuthGuard],
      data: { permission: 'profile' } 


    },
    {
      path: 'user/profile/create',
      loadChildren: () => import('../components/collections/tables.module')
      .then(m => m.TablesModule),
      component: UsersComponent,
      canActivate: [AuthGuard],
      data: { permission: 'profile' } 

    },
    {
      path: 'user/profile/:id',  
      loadChildren: () => import('../components/collections/tables.module')
      .then(m => m.TablesModule),
      component: UsersComponent,
      canActivate: [AuthGuard],
      data: { permission: 'profile' } 

    },
    {
      path: 'roles/all',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: RolesComponent,
      canActivate: [AuthGuard],

    },
    {
      path: 'permissions',
      loadChildren: () => import('../components/collections/tables.module')
        .then(m => m.TablesModule),
      component: CollectionTableComponent,
    },
    
    {
      path: 'iot-dashboard',
      component: DashboardComponent,
    },
    {
      path: 'layout',
      loadChildren: () => import('./layout/layout.module')
        .then(m => m.LayoutModule),
    },
    {
      path: 'forms',
      loadChildren: () => import('./forms/forms.module')
        .then(m => m.FormsModule),
    },
    {
      path: 'ui-features',
      loadChildren: () => import('./ui-features/ui-features.module')
        .then(m => m.UiFeaturesModule),
    },
    {
      path: 'modal-overlays',
      loadChildren: () => import('./modal-overlays/modal-overlays.module')
        .then(m => m.ModalOverlaysModule),
    },
    {
      path: 'extra-components',
      loadChildren: () => import('./extra-components/extra-components.module')
        .then(m => m.ExtraComponentsModule),
    },
    {
      path: 'maps',
      loadChildren: () => import('./maps/maps.module')
        .then(m => m.MapsModule),
    },
    {
      path: 'charts',
      loadChildren: () => import('./charts/charts.module')
        .then(m => m.ChartsModule),
    },
    {
      path: 'editors',
      loadChildren: () => import('./editors/editors.module')
        .then(m => m.EditorsModule),
    },
    {
      path: 'tables',
      loadChildren: () => import('./tables/tables.module')
        .then(m => m.TablesModule),
    },
    {
      path: 'miscellaneous',
      loadChildren: () => import('./miscellaneous/miscellaneous.module')
        .then(m => m.MiscellaneousModule),
    },
    {
      path: 'password-reset/:handle',
      loadChildren: () => import('../components/collections/tables.module')
          .then(m => m.TablesModule),
        component: UsersComponent,
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
