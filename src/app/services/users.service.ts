import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class UsersService {
  apiUrl=environment.baseEndpoint;
  httpOptions:any;
  constructor(private http: HttpClient, private router: Router) {
    this.httpOptions = {
      headers: new HttpHeaders({
      //   'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('admin:s#;j!md4C!UUY5E(L*=2')
      })
    };
   }
  logout(){
    localStorage.setItem('auth_app_token', '');
    this.router.navigate(['/auth/login']);
  }
  listUsers(endpointWithHandle): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer 14|eIJU7gr28Ey1J6cMTKK7NRTxxoYcKKECqDgLTP8maf5fdf6a`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
}
