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
    const headers = this.createHeaders();

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
  listRoles(endpointWithHandle): Observable<any> {
    const headers = this.createHeaders();

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
  createEntry( data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.post(`${this.apiUrl}/user/register`, data, { headers });
  }

  // Method to delete an entry
  deleteEntry(handle: string, entryId: string): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.delete(`${this.apiUrl}/user/delete/${entryId}`, { headers });
  }
  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer 15|ZIxXbmQ9eXlaV5t9BKfEdYS7tPrGskvMRj0peya6ed9d4223`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });
  }
}
