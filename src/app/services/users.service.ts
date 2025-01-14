import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  httpOptions:any;
  baseUrl=environment.baseEndpoint;
  constructor(private http: HttpClient) {
    this.httpOptions = {
      headers: new HttpHeaders({
      //   'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('admin:s#;j!md4C!UUY5E(L*=2')
      })
    };
   }
   listUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/login`);
  }
}
