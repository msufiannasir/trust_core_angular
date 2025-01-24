import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NbPasswordAuthStrategy, NbAuthResult } from '@nebular/auth';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class CustomPasswordAuthStrategy extends NbPasswordAuthStrategy {
  private tokenService: any;

  constructor(http: HttpClient, route: ActivatedRoute, private injector: Injector) {
    super(http, route); // Call the parent constructor
  }

  private getTokenService() {
    if (!this.tokenService) {
      this.tokenService = this.injector.get('NbTokenService'); // Inject dynamically to avoid circular dependency
    }
    return this.tokenService;
  }

  authenticate(data: any): Observable<NbAuthResult> {
    const endpoint = this.getOption('login.endpoint');
    const baseEndpoint = this.getOption('baseEndpoint');
    const method = this.getOption('login.method');
    var fullurl=baseEndpoint+endpoint;

    console.log('Custom authenticate method called:', fullurl, this.getOption('token.class'), 'token key ',this.getOption('token.key'));

    return this.http.request(method, fullurl, { body: data }).pipe(
      map((response: any) => {
        console.log('inside', response.token);
        const token = this.createToken(this.getOption('token.class'), response[this.getOption('token.key')]);
        // const token=response.token;
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('AuthToken', response.token);
        localStorage.setItem('token', response.token);
        // if (token.isValid()) {
          // this.getTokenService().set(token); // Dynamically get and use NbTokenService
          return new NbAuthResult(
            true,
            response,
            this.getOption('login.redirect.success'),
            [],
            this.getOption('messages.getter')(response),
            token
          );
        // } else {
        //   return new NbAuthResult(
        //     false,
        //     response,
        //     null,
        //     ['Invalid token'],
        //     this.getOption('errors.getter')(response)
        //   );
        // }
      }),
      catchError((error) => {
        console.error('Error in HTTP Request or Processing:', error);
        const errorGetter = this.getOption('errors.getter');
        const errorMessages = errorGetter ? errorGetter(error) : ['An unknown error occurred'];
        return of(
          new NbAuthResult(false, error, null, errorMessages, ['Login failed'])
        );
      })
    );
  }
  // Now implement the custom forgotPassword method
  requestPassword(data: any): Observable<NbAuthResult> {
    const endpoint =environment.baseEndpoint +'request-pass';  // Custom forgot password endpoint
    const method = 'post';  // HTTP method for forgot password
    return this.http.request(method, endpoint, { body: data }).pipe(
      map((response: any) => {
        console.log(response, 'response');
        if (response) {
          return new NbAuthResult(true, response, '/auth/login', [], []);
        }
        return new NbAuthResult(false, response.status, null, ['Failed to send password reset link'], []);
      }),
      catchError((error) => {
        
        return of(new NbAuthResult(false, error, null, [error.error.message], []));
      })
    );
  }
  resetPassword(data: any): Observable<NbAuthResult> {
    const endpoint = environment.baseEndpoint +'reset-password'; // Your custom endpoint for resetting the password
    const method = 'post'; // HTTP method
    var userdata=JSON.parse(localStorage.getItem('user'));
    data.token=localStorage.getItem('token');
    data.email=userdata.email;
    data.password_confirmation=data.confirmPassword;
    return this.http.request(method, endpoint, { body: data }).pipe(
      map((response: any) => {
        // Check for the success of the password reset request
        if (response.success) {
          return new NbAuthResult(true, response, '/auth/login', [], []);
        }

        // If the reset password request failed, return the appropriate error messages
        return new NbAuthResult(false, response, null, ['Failed to reset password'], []);
      }),
      catchError((error) => {
        // Handle any error that occurs during the API request
        return of(new NbAuthResult(false, error, null, ['Failed to reset password'], []));
      })
    );
  }
}
