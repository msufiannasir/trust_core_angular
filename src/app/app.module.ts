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
// import { FileUploadEditorComponent } from './file-upload-editor.component';
import { FileUploadEditorComponent } from './components/fileupload/file-upload-editor.component';

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
import { CustomPasswordAuthStrategy } from './auth/custom-password-auth-strategy'; // Import your custom strategy


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
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
            endpoint: '/login', // Login endpoint relative to baseEndpoint
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
        }),
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
      },
    }),
  ],
  providers: [CustomPasswordAuthStrategy], // Provide your custom strategy
  bootstrap: [AppComponent],
})
export class AppModule {}
