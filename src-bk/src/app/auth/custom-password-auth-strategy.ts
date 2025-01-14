import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { NbPasswordAuthStrategy, NbAuthResult } from '@nebular/auth';
import { NbTokenService } from '@nebular/auth';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class CustomPasswordAuthStrategy extends NbPasswordAuthStrategy {
  constructor(
    http: HttpClient,
    route: ActivatedRoute,
    private tokenService: NbTokenService  // Inject NbTokenService
  ) {
    super(http, route);
  }

  authenticate(data: any): Observable<NbAuthResult> {
    const endpoint = this.getOption('login.endpoint');
    const method = this.getOption('login.method');

    return this.http.request(method, endpoint, { body: data }).pipe(
      map((response: any) => {
        const token = this.createToken(this.getOption('token.class'), response[this.getOption('token.key')]);

        if (token.isValid()) {
          this.tokenService.set(token); // Save the token using NbTokenService
          return new NbAuthResult(
            true,
            response,
            this.getOption('login.redirect.success'),
            [],
            this.getOption('messages.getter')(response),
            token
          );
        } else {
          return new NbAuthResult(
            false,
            response,
            null,
            ['Invalid token'],
            this.getOption('errors.getter')(response)
          );
        }
      }),
      catchError((error) => {
        return of(
          new NbAuthResult(false, error, null, this.getOption('errors.getter')(error), ['Login failed'])
        );
      })
    );
  }
}
