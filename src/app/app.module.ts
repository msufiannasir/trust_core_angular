/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import {ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NbPasswordAuthStrategy } from '@nebular/auth';
import { BlueprintComponent } from './components/blueprint/blueprint.component'; // Import your custom strategy
import { Ng2SmartTableModule } from 'ng2-smart-table';
// import { FileUploadEditorComponent } from './file-upload-editor.component';
import { FileUploadEditorComponent } from './components/fileupload/file-upload-editor.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { CustomLinkRenderComponent } from './components/collections/collection-listing/custom-link-render.component';


import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,

} from '@nebular/theme';
import { NbAuthModule, NbAuthJWTToken, NbAuthSimpleToken } from '@nebular/auth';
import { CustomPasswordAuthStrategy } from './auth/custom-password-auth-strategy';
import { ReplacePipe } from './replace.pipe';
import { SitesettingsComponent } from './components/sitesettings/sitesettings.component'; // Import your custom strategy
// import { UsersettingsComponent } from './components/usersettings/usersettings.component'; // Import your custom strategy



@NgModule({
  exports: [ReplacePipe],
  declarations: [AppComponent, ReplacePipe, DatepickerComponent, BlueprintComponent, SitesettingsComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Ng2SmartTableModule,
    FormsModule, // Add this line
    ReactiveFormsModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    // FormsModule,
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    // Configure NbAuthModule
    NbAuthModule.forRoot({
      strategies: [
        CustomPasswordAuthStrategy.setup({
          name: 'email', // Name of the strategy
          baseEndpoint: environment.baseEndpoint, // Base endpoint (optional)
          login: {
            endpoint: 'login', // Login endpoint relative to baseEndpoint
            method: 'post', // HTTP method
            redirect: {
              success: '/dashboard', // Redirect URL on successful login
              failure: null, // Stay on the same page on failure
            },
          },
          
          token: {
            class: NbAuthSimpleToken,
            key: 'token', // Key in your API response that holds the token
          },
          errors: {
            getter: (response: any) => {
              console.log(response, ';response getter');
              // Custom logic to extract errors from API response
              return response.error ? response.error.message : 'Something went wrong';
            },
          },
          messages: {
            getter: (response: any) => {
              // Custom logic to extract success messages
              return response.message || 'Login successful';
            },
          },
        }),
        // NbPasswordAuthStrategy.setup({
        //   name: 'email', // Match the name from your custom strategy
        // }),
      ],
      forms: {
        login: {
          redirectDelay: 500, // Delay before redirecting
          showMessages: {
            success: true,
            error: true, // Show error messages
          },
          strategy: 'email', // Use the custom strategy
        },
        forgotPassword: {
          endpoint: '/forgot-password',  // Your custom forgot password endpoint
          method: 'post',  // HTTP method
          redirect: false,
          showMessages: {
            success: true,
            error: true,  // Enable showing error messages
          },
        },
        register: {
          // No need to configure this as the route can be disabled
        },
        
      },
    }),
  ],
  providers: [
    { provide: NbPasswordAuthStrategy, useClass: CustomPasswordAuthStrategy },
  ], // Provide your custom strategy
  bootstrap: [AppComponent],
})
export class AppModule {}
