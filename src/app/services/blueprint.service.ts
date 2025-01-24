import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import the environment file

// blueprint.service.ts
@Injectable({
  providedIn: 'root',
})
export class BlueprintService {
  private apiUrl = environment.baseEndpoint;
  constructor(private http: HttpClient) {}
  // Fetch collection fields
  getCollectionFields(handle: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${this.apiUrl}collections/${handle}/get-fields`, { headers });
  }
  createField(handle: string, payload: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.post(`${this.apiUrl}collections/${handle}/add-field`, payload , { headers });
  }
  
  updateField(handle: string, payload: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers
    return this.http.put(`${this.apiUrl}collections/${handle}/fields/edit`, payload , {headers});
  }
  
  deleteField(handle: string, payload: any): Observable<any> {
    const headers = this.createHeaders(); // Use the global method for headers

    return this.http.delete(`${this.apiUrl}collections/${handle}/fields/delete`, { body: payload , headers });
  }
  

  private createHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken');
    return new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    });
  }
}

