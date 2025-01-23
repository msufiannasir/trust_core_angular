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
    return this.http.get(`${this.apiUrl}/collections/${handle}/get-fields`, { headers });
  }

  // Create a new field
  createField(handle: string, data: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post(`${this.apiUrl}/collections/${handle}/add-field`, data, { headers });
  }

  // Delete a field
  deleteField(handle: string, fieldName: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.request('delete', `${this.apiUrl}/collections/${handle}/fields/delete`, {
      headers,
      body: { field_name: fieldName },
    });
  }

  // Update a field
  updateField(handle: string, data: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.apiUrl}/collections/${handle}/fields/edit`, data, { headers });
  }

  private createHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('AuthToken');
    return new HttpHeaders({
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    });
  }
}

