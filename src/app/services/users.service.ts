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
  currentUser=JSON.parse(localStorage.getItem('user'));
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
    localStorage.setItem('user', '');
    this.router.navigate(['/auth/login']);
  }
  listUsers(endpointWithHandle): Observable<any> {
    const headers = this.createHeaders();

    // Combine base API URL with the endpoint (handle dynamic API calls)
    const fullUrl = `${this.apiUrl}`+endpointWithHandle; // Full URL to the backend
    console.log(fullUrl, 'fullUrl');
    return this.http.get(fullUrl, { headers });
  }
  getUser(endpointWithHandle): Observable<any> {
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
    return this.http.post(`${this.apiUrl}user/register`, data, { headers });
  }
  updateUserProfile( data: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.post(`${this.apiUrl}user/edit/`+this.currentUser.id, data, { headers });
  }

  // Method to delete an entry
  deleteEntry(handle: string, entryId: string): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.delete(`${this.apiUrl}user/delete/${entryId}`, { headers });
  }


  getUserSettings(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${this.apiUrl}user/detail`, { headers });
  }
  
  

  private createHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken'); // Get the token from local storage
    return new HttpHeaders({
      'Authorization': `Bearer ${authToken}`, // Replace with the actual token dynamically
      'Content-Type': 'application/json',
    });
  }
}
